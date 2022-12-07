import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  AuthenticationGetSessionOptions,
  Disposable,
  Event,
  EventEmitter,
  l10n,
  FileChangeEvent,
  FileChangeType,
  Uri,
} from 'vscode'
import { nanoid } from 'nanoid'
import { Unsubscribe } from 'conf/dist/source/types'
import * as path from 'path'
import * as os from 'os'
import { executeAuthProcess, parseJwt } from './auth-process'
import {
  sendEventToAnalytics,
  EventNames,
  EventSubCategory,
} from '../../services/analyticsStreamApiService'
import { credentialsVaultService, Session, SESSION_KEY_NAME } from './credentialsVault'
import { configVaultService, CONFIGS_KEY_NAME } from './configVault'
import { logger } from '../../utils/logger'
import { notifyError } from '../../utils/notifyError'
import { authMessage } from '../../messages/messages'

export const AUTH_PROVIDER_ID = 'AffinidiAuth'
const AUTH_NAME = 'Affinidi'

const convertSession = (session: Session) => {
  return {
    id: session.sessionId,
    accessToken: session.consoleAuthToken,
    account: { label: session.account.label, id: session.account.userId },
    scopes: [],
  }
}

const assertSession = (sessionValue: Session | null): AuthenticationSession | undefined => {
  return sessionValue ? convertSession(sessionValue) : undefined
}

const readSessionFromStorage = (): AuthenticationSession | undefined => {
  const storageValue = credentialsVaultService.getSession()
  return assertSession(storageValue)
}

export class AffinidiAuthenticationProvider implements AuthenticationProvider, Disposable {
  private readonly _disposable: Disposable

  private readonly _confUnsubscribe: Unsubscribe

  private readonly _onDidChangeSessions =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>()

  private readonly _onDidChangeActiveProject = new EventEmitter<FileChangeEvent>()

  constructor() {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(AUTH_PROVIDER_ID, AUTH_NAME, this, {
        supportsMultipleAccounts: false,
      }),
    )
    this._confUnsubscribe = credentialsVaultService.onDidChange(
      SESSION_KEY_NAME,
      this.handleExternalChangeSession,
    )
    configVaultService.onDidChange(CONFIGS_KEY_NAME, this.handleExternalChangeActiveProject)
  }

  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event
  }

  get onDidChangeActiveProject(): Event<FileChangeEvent> {
    return this._onDidChangeActiveProject.event
  }

  dispose(): void {
    this._confUnsubscribe()
    this._disposable.dispose()
  }

  async isLoggedIn(): Promise<boolean> {
    return Boolean(await this.getActiveSession())
  }

  async getActiveSession(
    options?: AuthenticationGetSessionOptions,
    scopes: string[] = [],
  ): Promise<AuthenticationSession | undefined> {
    try {
      const session = await authentication.getSession(AUTH_PROVIDER_ID, scopes, options)

      if (session) {
        const token = parseJwt(session.accessToken)

        // subtract 1 minute in case of lag
        if (Date.now() / 1000 >= token.exp - 60) {
          // TODO: we might want to log an analytics event here
          this.handleRemoveSession()
          return this.getActiveSession(options, scopes) // try again
        }
      }

      return session
    } catch (error) {
      logger.error(error, authMessage.noValidSessionFound)
      this.handleRemoveSession()
      return undefined
    }
  }

  async requireActiveSession(
    options: AuthenticationGetSessionOptions,
    scopes: string[] = [],
  ): Promise<AuthenticationSession> {
    const session = await this.getActiveSession(options, scopes)
    if (!session) {
      throw new Error(authMessage.noValidSessionFound)
    }

    return session
  }

  // This function is called first when `vscode.authentication.getSessions` is called.
  async getSessions(): Promise<readonly AuthenticationSession[]> {
    const session = readSessionFromStorage()
    return session ? [session] : []
  }

  // This function is called after `this.getSessions` is called and only when:
  // - `this.getSessions` returns nothing but `createIfNone` was set to `true` in `vscode.authentication.getSessions`
  // - `vscode.authentication.getSessions` was called with `forceNewSession: true`
  // - The end user initiates the "silent" auth flow via the Accounts menu
  async createSession(_scopes: string[]): Promise<AuthenticationSession> {
    try {
      const { email, id, accessToken } = await executeAuthProcess({
        isSignUp: _scopes.includes('signup'),
      })
      const session: AuthenticationSession = {
        id: nanoid(),
        accessToken,
        account: { label: email, id },
        scopes: [],
      }

      credentialsVaultService.setSession({
        sessionId: session.id,
        consoleAuthToken: accessToken,
        account: { label: email, userId: id },
        scopes: [],
      })
      configVaultService.setCurrentUserID(session.account.id)

      this._onDidChangeSessions.fire({
        added: [session],
        removed: [],
        changed: [],
      })

      return session
    } catch (error: unknown) {
      logger.error(error, authMessage.unableToCreateSession)
      notifyError(error)
      throw error
    }
  }

  /**
   * This function is called when the end indirectly user signs out of the account with VS Code UI or some other means.
   * Do not use this method to manually remove the session.
   * @deprecated Use `handleRemoveSession` instead
   */
  async removeSession(): Promise<void> {
    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidi.logout',
      },
    })

    this.handleRemoveSession()
  }

  handleRemoveSession = (): void => {
    const session = readSessionFromStorage()

    if (session) {
      configVaultService.deleteCurrentUserId()
      credentialsVaultService.clear()
      this._onDidChangeSessions.fire({
        added: [],
        removed: [session],
        changed: [],
      })
    }
  }

  handleExternalChangeSession = (newValue: unknown, oldValue: unknown): void => {
    // @ts-ignore
    const oldSession = oldValue ? assertSession(oldValue) : null
    // @ts-ignore
    const newSession = newValue ? assertSession(newValue) : null

    // If it's the same session ID we consider it a change
    if (oldSession && newSession && oldSession?.id === newSession?.id) {
      configVaultService.setCurrentUserID(newSession.account.id)
      this._onDidChangeSessions.fire({
        added: [],
        removed: [],
        changed: [newSession],
      })
      return
    }

    // If not then we remove old session and add new session
    const added = []
    const removed = []
    if (oldSession) removed.push(oldSession)
    if (newSession) {
      added.push(newSession)
      configVaultService.setCurrentUserID(newSession.account.id)
    }
    this._onDidChangeSessions.fire({
      added,
      removed,
      changed: [],
    })
  }

  handleExternalChangeActiveProject = (): void => {
    this._onDidChangeActiveProject.fire({
      type: FileChangeType.Changed,
      uri: Uri.file(path.join(os.homedir(), '.affinidi/config.json')),
    })
  }
}
