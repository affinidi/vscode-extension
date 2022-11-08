import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  AuthenticationGetSessionOptions,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  SecretStorage,
  window,
} from "vscode";
import { nanoid } from "nanoid";
import { executeAuthProcess, parseJwt } from "./auth-process";
import {
  sendEventToAnalytics,
  EventNames,
} from "../../services/analyticsStreamApiService";

export const AUTH_PROVIDER_ID = "AffinidiAuth";
const AUTH_NAME = "Affinidi Authentication";
const AUTH_SECRET_KEY = "AffinidiAuth";

export class AffinidiAuthenticationProvider
  implements AuthenticationProvider, Disposable
{
  private readonly _secretStorage: SecretStorage;
  private readonly _disposable: Disposable;
  private _onDidChangeSessions =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();

  constructor(context: ExtensionContext) {
    this._secretStorage = context.secrets;
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(
        AUTH_PROVIDER_ID,
        AUTH_NAME,
        this,
        { supportsMultipleAccounts: false }
      )
    );
  }

  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event;
  }

  dispose(): void {
    this._disposable.dispose();
  }

  async getActiveSession(
    options: AuthenticationGetSessionOptions,
    scopes: string[] = []
  ): Promise<AuthenticationSession | undefined> {
    const session = await authentication.getSession(
      AUTH_PROVIDER_ID,
      scopes,
      options
    );

    if (session) {
      const token = parseJwt(session.accessToken.slice(18));

      // subtract 1 minute in case of lag
      if (Date.now() / 1000 >= token.exp - 60) {
        // TODO: we might want to log an analytics event here
        await this.handleRemoveSession(session.id);
        return this.getActiveSession(options, scopes); // try again
      }
    }

    return session;
  }

  async requireActiveSession(
    options: AuthenticationGetSessionOptions,
    scopes: string[] = []
  ): Promise<AuthenticationSession> {
    const session = await this.getActiveSession(options, scopes);
    if (!session) {
      throw new Error("Authentication session is required, but not found");
    }

    return session;
  }

  // This function is called first when `vscode.authentication.getSessions` is called.
  async getSessions(
    _scopes?: string[]
  ): Promise<readonly AuthenticationSession[]> {
    return this._readSessionsFromStorage();
  }

  // This function is called after `this.getSessions` is called and only when:
  // - `this.getSessions` returns nothing but `createIfNone` was set to `true` in `vscode.authentication.getSessions`
  // - `vscode.authentication.getSessions` was called with `forceNewSession: true`
  // - The end user initiates the "silent" auth flow via the Accounts menu
  async createSession(_scopes: string[]): Promise<AuthenticationSession> {
    try {
      const { email, id, accessToken } = await executeAuthProcess({
        isSignUp: _scopes.includes("signup"),
      });
      const session: AuthenticationSession = {
        id: nanoid(),
        accessToken,
        account: { label: email, id },
        scopes: [],
      };

      await this._secretStorage.store(
        AUTH_SECRET_KEY,
        JSON.stringify([session])
      );

      this._onDidChangeSessions.fire({
        added: [session],
        removed: [],
        changed: [],
      });

      return session;
    } catch (error) {
      if (error instanceof Error) {
        window.showErrorMessage(error.message);
      }
      throw error;
    }
  }

  /**
   * This function is called when the end indirectly user signs out of the account with VS Code UI or some other means.
   * Do not use this method to manually remove the session.
   * @deprecated Use `handleRemoveSession` instead
   */
  async removeSession(_sessionId: string): Promise<void> {
    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: "logout",
      metadata: {
        commandId: "affinidi.logout",
      },
    });

    await this.handleRemoveSession(_sessionId);
  }

  async handleRemoveSession(_sessionId: string): Promise<void> {
    const sessions = await this._readSessionsFromStorage();
    const idxToRemove = sessions.findIndex(
      (session) => session.id === _sessionId
    );

    if (idxToRemove !== -1) {
      const session = sessions[idxToRemove];

      sessions.splice(idxToRemove, 1);

      await this._secretStorage.store(
        AUTH_SECRET_KEY,
        JSON.stringify(sessions)
      );

      this._onDidChangeSessions.fire({
        added: [],
        removed: [session],
        changed: [],
      });
    }
  }

  private async _readSessionsFromStorage(): Promise<AuthenticationSession[]> {
    const storageValue = await this._secretStorage.get(AUTH_SECRET_KEY);
    return JSON.parse(storageValue || "[]") as AuthenticationSession[];
  }
}
