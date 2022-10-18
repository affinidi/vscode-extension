// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { loginHandler } from "./auth/commands/loginHandler";
import { AffinidiExplorerProvider } from "./AffinidiExplorerProvider";
import { AffinidiOTPAuthenticationProvider } from "./auth/authProvider";
import { logoutHandler } from "./auth/commands/logoutHandler";
import { registerHandler } from "./auth/commands/registerHandler";
import { ext } from "./extensionVariables";
import { userDetailsHandler } from "./auth/commands/userDetailsHandler";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activateInternal(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Congratulations, your Affinidi extension is now active!");

  ext.context = context;
  ext.outputChannel = vscode.window.createOutputChannel("Affinidi");

  const affExplorerTreeProvider = new AffinidiExplorerProvider();
  vscode.window.createTreeView("affinidiExplorer", {
    treeDataProvider: affExplorerTreeProvider,
    canSelectMany: false,
    showCollapseAll: true,
    dragAndDropController: affExplorerTreeProvider,
  });

  vscode.commands.registerCommand("affinidiExplorer.projectRefresh", () =>
    affExplorerTreeProvider.refresh()
  );

  let disposable = vscode.commands.registerCommand(
    "affinidi.schema.create",
    () => {
      vscode.window.showErrorMessage("Creating a schema...");
    }
  );
  context.subscriptions.push(disposable);

  // Authentication

  // Register our authentication provider. NOTE: this will register the provider globally which means that
  // any other extension can use this provider via the `getSession` API.
  let authProvider = new AffinidiOTPAuthenticationProvider(context.secrets);
  context.subscriptions.push(
    vscode.authentication.registerAuthenticationProvider(
      AffinidiOTPAuthenticationProvider.id,
      "Affinidi Auth",
      authProvider
    )
  );
  ext.authProvider = authProvider;

  let login = vscode.commands.registerCommand("affinidi.login", loginHandler);
  context.subscriptions.push(login);
  let logout = vscode.commands.registerCommand(
    "affinidi.logout",
    logoutHandler
  );
  context.subscriptions.push(logout);
  let userDetails = vscode.commands.registerCommand(
    "affinidi.me",
    userDetailsHandler
  );
  context.subscriptions.push(userDetails);
  let register = vscode.commands.registerCommand(
    "affinidi.register",
    registerHandler
  );
  context.subscriptions.push(register);
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  vscode.window.showInformationMessage("Goodbye!!!");
}
