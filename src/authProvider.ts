import {
	authentication,
	AuthenticationProvider,
	AuthenticationProviderAuthenticationSessionsChangeEvent,
	AuthenticationSession,
	Disposable,
	Event,
	EventEmitter,
	SecretStorage,
	window,
} from 'vscode';

/*
	This doesn't work. It was a copy and paste from a sample, but we need to get it working ;)
*/

class AffinidiOTPSession implements AuthenticationSession {
	readonly account = { id: AffinidiLoginProvider.id, label: 'Affinidi Access Token' };
	readonly id = AffinidiLoginProvider.id;
	readonly scopes = [];

	/**
	 * 
	 * @param accessToken The access token to use for authentication
	 */
	constructor(public readonly accessToken: string) {}
}

export class AffinidiLoginProvider implements AuthenticationProvider, Disposable {
	static id = 'AffinidiOTP';
	private static secretKey = 'AffinidiOTP';

	// this property is used to determine if the token has been changed in another window of VS Code.
	// It is used in the checkForUpdates function.
	private currentToken: Promise<string | undefined> | undefined;
	private initializedDisposable: Disposable | undefined;

	private _onDidChangeSessions = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
	get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
		return this._onDidChangeSessions.event;
	}

	constructor(private readonly secretStorage: SecretStorage) { }

	dispose(): void {
		this.initializedDisposable?.dispose();
	}

	private ensureInitialized(): void {
		if (this.initializedDisposable === undefined) {
			void this.cacheTokenFromStorage();

			this.initializedDisposable = Disposable.from(
				// This onDidChange event happens when the secret storage changes in _any window_ since
				// secrets are shared across all open windows.
				this.secretStorage.onDidChange(e => {
					if (e.key === AffinidiLoginProvider.secretKey) {
						void this.checkForUpdates();
					}
				}),
				// This fires when the user initiates a "silent" auth flow via the Accounts menu.
				authentication.onDidChangeSessions(e => {
					if (e.provider.id === AffinidiLoginProvider.id) {
						void this.checkForUpdates();
					}
				}),
			);
		}
	}

	// This is a crucial function that handles whether or not the token has changed in
	// a different window of VS Code and sends the necessary event if it has.
	private async checkForUpdates(): Promise<void> {
		const added: AuthenticationSession[] = [];
		const removed: AuthenticationSession[] = [];
		const changed: AuthenticationSession[] = [];

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
		this._onDidChangeSessions.fire({ added: added, removed: removed, changed: changed });
	}

	private cacheTokenFromStorage() {
		this.currentToken = this.secretStorage.get(AffinidiLoginProvider.secretKey) as Promise<string | undefined>;
		return this.currentToken;
	}

	// This function is called first when `vscode.authentication.getSessions` is called.
	async getSessions(_scopes?: string[]): Promise<readonly AuthenticationSession[]> {
		this.ensureInitialized();
		const token = await this.cacheTokenFromStorage();
		return token ? [new AffinidiOTPSession(token)] : [];
	}

	// This function is called after `this.getSessions` is called and only when:
	// - `this.getSessions` returns nothing but `createIfNone` was set to `true` in `vscode.authentication.getSessions`
	// - `vscode.authentication.getSessions` was called with `forceNewSession: true`
	// - The end user initiates the "silent" auth flow via the Accounts menu
	async createSession(_scopes: string[]): Promise<AuthenticationSession> {
		this.ensureInitialized();

		const token = await window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: 'Affinidi Access Token',
			prompt: 'Enter your Affinidi Access Token',
			password: true,
		});

		// Note: this example doesn't do any validation of the token beyond making sure it's not empty.
		if (!token) {
			throw new Error('Access token is required');
		}

		// Don't set `currentToken` here, since we want to fire the proper events in the `checkForUpdates` call
		await this.secretStorage.store(AffinidiLoginProvider.secretKey, token);
		console.log('Successfully logged in to Affinidi');

		return new AffinidiOTPSession(token);
	}

	// This function is called when the end user signs out of the account.
	async removeSession(_sessionId: string): Promise<void> {
		await this.secretStorage.delete(AffinidiLoginProvider.secretKey);
	}
}