// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { commands, ExtensionContext, window } from "vscode";
import { AffinidiExplorerProvider } from "./treeView/affinidiExplorerProvider";
import { ext } from "./extensionVariables";
import { initAuthentication } from "./auth/init-authentication";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activateInternal(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Congratulations, your Affinidi extension is now active!");

  ext.context = context;
  ext.outputChannel = window.createOutputChannel("Affinidi");
  ext.authProvider = initAuthentication();

  const affExplorerTreeProvider = new AffinidiExplorerProvider();

  window.createTreeView("affinidiExplorer", {
    treeDataProvider: affExplorerTreeProvider,
    canSelectMany: false,
    showCollapseAll: true,
  });

  commands.registerCommand("affinidiExplorer.projectRefresh", () => {
    affExplorerTreeProvider.refresh();
  });

  commands.registerCommand("affinidiExplorer.issuanceRefresh", () => {
    affExplorerTreeProvider.refresh();
  });

  commands.registerCommand("affinidiExplorer.schemaRefresh", () => {
    affExplorerTreeProvider.refresh();
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("affinidi.openBulkIssuanceMarkDown", () => {
      let uri: vscode.Uri = vscode.Uri.file(
        path.join(context.extensionPath, "/document/bulkIssuance.md")
      );
      vscode.commands.executeCommand("markdown.showPreview", uri);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("affinidi.schema.create", () => {
      window.showErrorMessage("Creating a schema...");
    })
  );
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  window.showInformationMessage("Goodbye!!!");
}
