/* eslint-disable no-underscore-dangle */
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
} from 'vscode'
import { nanoid } from 'nanoid'
import { Unsubscribe } from 'conf/dist/source/types'
import { executeAuthProcess, parseJwt } from './auth-process'
import {
  sendEventToAnalytics,
  EventNames,
  EventSubCategory,
} from '../../services/analyticsStreamApiService'
import { SESSION_KEY_NAME, vaultService } from './vault'
import { logger } from '../../utils/logger'
import { notifyError } from '../../utils/notifyError'

export const AUTH_PROVIDER_ID = 'AffinidiAuth'
const AUTH_NAME = 'Affinidi'

const assertSession = (sessionValue: unknown): AuthenticationSession | undefined => {
  return typeof sessionValue === 'string' && sessionValue
    ? (JSON.parse(sessionValue) as AuthenticationSession)
    : undefined
}

const readSessionFromStorage = (): AuthenticationSession | undefined => {
  const storageValue = vaultService.get(SESSION_KEY_NAME)
  return assertSession(storageValue)
}

export class AffinidiAuthenticationProvider implements AuthenticationProvider, Disposable {
  private readonly _disposable: Disposable

  private readonly _confUnsubscribe: Unsubscribe

  private readonly _onDidChangeSessions =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>()

  constructor() {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(AUTH_PROVIDER_ID, AUTH_NAME, this, {
        supportsMultipleAccounts: false,
      }),
    )
    this._confUnsubscribe = vaultService.onDidChange(
      SESSION_KEY_NAME,
      this.handleExternalChangeSession,
    )
  }

  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event
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
        const token = parseJwt(session.accessToken.slice(18))

        // subtract 1 minute in case of lag
        if (Date.now() / 1000 >= token.exp - 60) {
          // TODO: we might want to log an analytics event here
          this.handleRemoveSession()
          return this.getActiveSession(options, scopes) // try again
        }
      }

      return session
    } catch (error) {
      logger.error(error, 'Failed to get active session')
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
      throw new Error(l10n.t('Valid Affinidi authentication session not found'))
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

      vaultService.set(SESSION_KEY_NAME, JSON.stringify(session))

      this._onDidChangeSessions.fire({
        added: [session],
        removed: [],
        changed: [],
      })

      return session
    } catch (error: unknown) {
      logger.error(error, 'Failed to create a session')
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
      vaultService.delete(SESSION_KEY_NAME)
      this._onDidChangeSessions.fire({
        added: [],
        removed: [session],
        changed: [],
      })
    }
  }

  handleExternalChangeSession = (newValue: unknown, oldValue: unknown): void => {
    const oldSession = oldValue ? assertSession(oldValue) : null
    const newSession = newValue ? assertSession(newValue) : null

    // If it's the same session ID we consider it a change
    if (oldSession && newSession && oldSession?.id === newSession?.id) {
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
    if (newSession) added.push(newSession)
    this._onDidChangeSessions.fire({
      added,
      removed,
      changed: [],
    })
  }
}
