import * as vscode from "vscode";
import { login, loginConfirm } from "./authService";
import { validateEmail, validateOTP } from "./validators";

class AffinidiOTPSession implements vscode.AuthenticationSession {
  // We don't know the user's account name, so we'll just use a constant
  readonly account = {
    id: AffinidiOTPAuthenticationProvider.id,
    label: "Affinidi Session",
  };
  // This id isn't used for anything in this example, so we set it to a constant
  readonly id = AffinidiOTPAuthenticationProvider.id;
  // We don't know what scopes the PAT has, so we have an empty array here.
  readonly scopes = [];

  /**
   *
   * @param accessToken The access token to use for authentication
   */
  constructor(public readonly accessToken: string) {}
}

export class AffinidiOTPAuthenticationProvider
  implements vscode.AuthenticationProvider, vscode.Disposable
{
  static id = "AffinidiOTP";
  private static secretKey = "AffinidiAccessToken";

  // this property is used to determine if the token has been changed in another window of VS Code.
  // It is used in the checkForUpdates function.
  private currentToken: Promise<string | undefined> | undefined;
  private initializedDisposable: vscode.Disposable | undefined;

  private _onDidChangeSessions =
    new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
  get onDidChangeSessions(): vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event;
  }

  constructor(private readonly secretStorage: vscode.SecretStorage) {}

  dispose(): void {
    this.initializedDisposable?.dispose();
  }

  private ensureInitialized(): void {
    if (this.initializedDisposable === undefined) {
      void this.cacheTokenFromStorage();

      this.initializedDisposable = vscode.Disposable.from(
        // This onDidChange event happens when the secret storage changes in _any window_ since
        // secrets are shared across all open windows.
        this.secretStorage.onDidChange((e) => {
          if (e.key === AffinidiOTPAuthenticationProvider.secretKey) {
            void this.checkForUpdates();
          }
        }),
        // This fires when the user initiates a "silent" auth flow via the Accounts menu.
        vscode.authentication.onDidChangeSessions((e) => {
          if (e.provider.id === AffinidiOTPAuthenticationProvider.id) {
            void this.checkForUpdates();
          }
        })
      );
    }
  }

  // This is a crucial function that handles whether or not the token has changed in
  // a different window of VS Code and sends the necessary event if it has.
  private async checkForUpdates(): Promise<void> {
    const added: vscode.AuthenticationSession[] = [];
    const removed: vscode.AuthenticationSession[] = [];
    const changed: vscode.AuthenticationSession[] = [];

    const previousToken = await this.currentToken;
    const session = (await this.getSessions())[0];

    if (session?.accessToken && !previousToken) {
      added.push(session);
    } else if (!session?.accessToken && previousToken) {
      removed.push(session);
    } else if (session?.accessToken !== previousToken) {
      changed.push(session);
    } else {
      return;
    }

    void this.cacheTokenFromStorage();
    this._onDidChangeSessions.fire({
      added: added,
      removed: removed,
      changed: changed,
    });
  }

  private cacheTokenFromStorage() {
    this.currentToken = this.secretStorage.get(
      AffinidiOTPAuthenticationProvider.secretKey
    ) as Promise<string | undefined>;
    return this.currentToken;
  }

  // This function is called first when `vscode.authentication.getSessions` is called.
  async getSessions(
    _scopes?: string[]
  ): Promise<readonly vscode.AuthenticationSession[]> {
    this.ensureInitialized();
    const token = await this.cacheTokenFromStorage();
    return token ? [new AffinidiOTPSession(token)] : [];
  }

  // This function is called after `this.getSessions` is called and only when:
  // - `this.getSessions` returns nothing but `createIfNone` was set to `true` in `vscode.authentication.getSessions`
  // - `vscode.authentication.getSessions` was called with `forceNewSession: true`
  // - The end user initiates the "silent" auth flow via the Accounts menu
  async createSession(
    _scopes: string[]
  ): Promise<vscode.AuthenticationSession> {
    this.ensureInitialized();

    const email = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Affinidi Account Email",
      prompt: "Enter your email associated with your Affinidi Account",
      validateInput: validateEmail,
    });

    if (!email) {
      throw new Error("Email is required");
    }

    const tokenChallenge = await login(email);
    console.log("Token Challenge", tokenChallenge);

    const confirmationCode = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Confirmation Code",
      prompt: "Paste the code sent to your email",
      validateInput: validateOTP,
    });

    if (!confirmationCode) {
      throw new Error("Confirmation Code is required");
    }

    const token = await loginConfirm(confirmationCode, tokenChallenge);

    await this.secretStorage.store(
      AffinidiOTPAuthenticationProvider.secretKey,
      token
    );

    return new AffinidiOTPSession(token);
  }

  // This function is called when the end user signs out of the account.
  async removeSession(_sessionId: string): Promise<void> {
    await this.secretStorage.delete(
      AffinidiOTPAuthenticationProvider.secretKey
    );
  }
}
