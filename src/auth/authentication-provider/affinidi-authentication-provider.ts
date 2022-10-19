import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  SecretStorage,
} from "vscode";
import { nanoid } from "nanoid";
import { executeLoginProcess } from "./login-process";

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
    const { email, id, accessToken } = await executeLoginProcess();
    const session: AuthenticationSession = {
      id: nanoid(),
      accessToken,
      account: { label: email, id },
      scopes: [],
    };

    await this._secretStorage.store(AUTH_SECRET_KEY, JSON.stringify([session]));

    return session;
  }

  // This function is called when the end user signs out of the account.
  async removeSession(_sessionId: string): Promise<void> {
    const sessions = await this._readSessionsFromStorage();
    const idxToRemove = sessions.findIndex(
      (session) => session.id === _sessionId
    );

    if (idxToRemove !== -1) {
      const session = sessions[idxToRemove];

      sessions.splice(idxToRemove, 1);

      this._onDidChangeSessions.fire({
        added: [],
        removed: [session],
        changed: [],
      });

      await this._secretStorage.store(
        AUTH_SECRET_KEY,
        JSON.stringify(sessions)
      );
    }
  }

  private async _readSessionsFromStorage(): Promise<AuthenticationSession[]> {
    const storageValue = await this._secretStorage.get(AUTH_SECRET_KEY);

    return JSON.parse(storageValue || "[]") as AuthenticationSession[];
  }
}
