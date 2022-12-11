import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  AuthenticationGetSessionOptions,
  Disposable,
  Event,
  EventEmitter,
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
import { credentialsVault, Session } from '../../config/credentialsVault'
import { configVault } from '../../config/configVault'
import { logger } from '../../utils/logger'
import { notifyError } from '../../utils/notifyError'
import { authMessage } from '../../messages/messages'

export const AUTH_PROVIDER_ID = 'AffinidiAuth'
const AUTH_NAME = 'Affinidi'

const convertToVsCodeSession = (session: Session): AuthenticationSession => {
  return {
    id: session.sessionId,
    accessToken: session.consoleAuthToken,
    account: { label: session.account.label, id: session.account.userId },
    scopes: [],
  }
}

const readSessionFromStorage = (): AuthenticationSession | undefined => {
  const storageValue = credentialsVault.getSession()
  return storageValue ? convertToVsCodeSession(storageValue) : undefined
}

export class AffinidiAuthenticationProvider implements AuthenticationProvider, Disposable {
  private readonly _disposable: Disposable

  private readonly _onDidChangeSessions =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>()

  constructor() {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(AUTH_PROVIDER_ID, AUTH_NAME, this, {
        supportsMultipleAccounts: false,
      }),
      { dispose: credentialsVault.onSessionChange(this.handleExternalChangeSession) }
    )
  }

  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event
  }

  dispose(): void {
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

      credentialsVault.setSession({
        sessionId: session.id,
        consoleAuthToken: accessToken,
        account: { label: email, userId: id },
        scopes: [],
      })
      configVault.setCurrentUserId(session.account.id)

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
      configVault.delete('currentUserId')
      credentialsVault.clear()
      this._onDidChangeSessions.fire({
        added: [],
        removed: [session],
        changed: [],
      })
    }
  }

  handleExternalChangeSession = (newSession: Session | undefined, oldSession: Session | undefined): void => {
    if (oldSession && newSession && oldSession.sessionId === newSession.sessionId) {
      this._onDidChangeSessions.fire({
        added: [],
        removed: [],
        changed: [convertToVsCodeSession(newSession)],
      })
    } else {
      this._onDidChangeSessions.fire({
        added: newSession ? [convertToVsCodeSession(newSession)] : [],
        removed: oldSession ? [convertToVsCodeSession(oldSession)] : [],
        changed: [],
      })
    }

    if (newSession) {
      configVault.setCurrentUserId(newSession.account.userId)
    }
  }
}
