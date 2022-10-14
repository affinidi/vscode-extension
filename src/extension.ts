// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AffinidiDevToolsProvider } from './affinidiDevToolsProvider';
import { AffinidiLoginProvider } from './authProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function affToolkitActivate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "affinidi-dev-console" is now active!');
   
	const affExplorerTreeProvider = new AffinidiDevToolsProvider();
	const treeDevTools = vscode.window.createTreeView('affinidiExplorer', {
		treeDataProvider: affExplorerTreeProvider,
		canSelectMany: false,
		showCollapseAll: true,
		dragAndDropController: affExplorerTreeProvider
	});

	vscode.commands.registerCommand('affinidiExplorer.refresh', () =>
		affExplorerTreeProvider.refresh()
	);

	vscode.commands.registerCommand('affinidi.codegen.verifier', async () =>
	{
		const result = await vscode.window.showInputBox({
			"title": "Code generator",
			"value" : "Blah"
		});
		}
	);


	let helloWorld = vscode.commands.registerCommand('affinidi-dev-console.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Affinidi Dev Console!');
	});

	context.subscriptions.push(vscode.authentication.registerAuthenticationProvider(
		AffinidiLoginProvider.id,
		'Affinidi Auth',
		new AffinidiLoginProvider(context.secrets),
	));

	let login = vscode.commands.registerCommand('vscode-authenticationprovider-sample.login', async () => {
		// Get our PAT session.
		const session = await vscode.authentication.getSession(AffinidiLoginProvider.id, [], { createIfNone: true });

		try {
			
			/*
			// Make a request to the Authentication API.

			const req = await fetch('https://auth-endpoint???', {
				headers: {
					authorization: `Basic ${Buffer.from(`:${session.accessToken}`).toString('base64')}`,
					'content-type': 'application/json',
				},
			});
			if (!req.ok) {
				throw new Error(req.statusText);
			}
			const res = await req.json() as { displayName: string };
			vscode.window.showInformationMessage(`Hello ${res.displayName}`);
			*/
		} catch (e: any) {
			if (e.message === 'Unauthorized') {
				vscode.window.showErrorMessage('Failed to get profile. You need to use a token that has access to all organizations. Please sign out and try again.');
			}
			throw e;
		}
	});

	context.subscriptions.push(login);	
	context.subscriptions.push(helloWorld);
}

// This method is called when your extension is deactivated
export function affToolkitDeactivate() {
	vscode.window.showInformationMessage("Goodbye!!!");
}


