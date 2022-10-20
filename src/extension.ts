// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import { commands, ExtensionContext, Uri, window } from "vscode";
import { AffinidiExplorerProvider } from "./treeView/affinidiExplorerProvider";
import { ext } from "./extensionVariables";
import { initAuthentication } from "./auth/init-authentication";
const fs = require("fs");
import { viewProjectProperties } from "./services/viewPropertiesService";

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

  commands.registerCommand("affinidiExplorer.refresh", () => {
    affExplorerTreeProvider.refresh();
  });

  context.subscriptions.push(
    commands.registerCommand("affinidi.openBulkIssuanceMarkDown", () => {
      let uri: Uri = Uri.file(
        path.join(context.extensionPath, "/document/bulkIssuance.md")
      );
      commands.executeCommand("markdown.showPreview", uri);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("affinidi.codegen.schemaOffers", () => {
      window.showErrorMessage("Code generation is still WIP");
    })
  );

  commands.registerCommand(
    "affinidiExplorer.viewProjectProperties",
    async (context: any) => {
      viewProjectProperties(context, affExplorerTreeProvider.projectsSummary);
    }
  );
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  window.showInformationMessage("Goodbye!!!");
}
