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
  window,
  l10n,
} from 'vscode'
import { nanoid } from 'nanoid'
import { executeAuthProcess, parseJwt } from './auth-process'
import { sendEventToAnalytics, EventNames } from '../../services/analyticsStreamApiService'
import { SESSION_KEY_NAME, vaultService } from './vault'

export const AUTH_PROVIDER_ID = 'AffinidiAuth'
const AUTH_NAME = 'Affinidi'

export class AffinidiAuthenticationProvider implements AuthenticationProvider, Disposable {
  private readonly _disposable: Disposable

  private readonly _onDidChangeSessions =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>()

  constructor() {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(AUTH_PROVIDER_ID, AUTH_NAME, this, {
        supportsMultipleAccounts: false,
      }),
    )
  }

  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event
  }

  dispose(): void {
    this._disposable.dispose()
  }

  async getActiveSession(
    options: AuthenticationGetSessionOptions,
    scopes: string[] = [],
  ): Promise<AuthenticationSession | undefined> {
    const session = await authentication.getSession(AUTH_PROVIDER_ID, scopes, options)

    if (session) {
      const token = parseJwt(session.accessToken.slice(18))

      // subtract 1 minute in case of lag
      if (Date.now() / 1000 >= token.exp - 60) {
        // TODO: we might want to log an analytics event here
        await this.handleRemoveSession()
        return this.getActiveSession(options, scopes) // try again
      }
    }

    return session
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
    const session = this.readSessionFromStorage()
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
    } catch (error) {
      if (error instanceof Error) {
        window.showErrorMessage(error.message)
      }
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
      subCategory: 'logout',
      metadata: {
        commandId: 'affinidi.logout',
      },
    })

    this.handleRemoveSession()
  }

  handleRemoveSession(): void {
    const session = this.readSessionFromStorage()

    if (session) {
      vaultService.delete(SESSION_KEY_NAME)
      this._onDidChangeSessions.fire({
        added: [],
        removed: [session],
        changed: [],
      })
    }
  }

  private readSessionFromStorage(): AuthenticationSession | undefined {
    const storageValue = vaultService.get(SESSION_KEY_NAME)
    return storageValue ? (JSON.parse(storageValue) as AuthenticationSession) : undefined
  }
}
