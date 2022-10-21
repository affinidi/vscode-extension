// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import {
  commands,
  ExtensionContext,
  Uri,
  window,
  env,
  ViewColumn,
  WebviewPanel,
} from "vscode";
import { AffinidiExplorerProvider } from "./treeView/affinidiExplorerProvider";
import { ext } from "./extensionVariables";
import { initAuthentication } from "./auth/init-authentication";
import AffResourceTreeItem from "./treeView/treeItem";
import { viewProperties } from "./services/viewPropertiesService";
import { getSchema } from "./services/schemaManagerService";
import { getWebviewContent } from "./ui/getWebviewContent";

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

  const treeView = window.createTreeView("affinidiExplorer", {
    treeDataProvider: affExplorerTreeProvider,
    canSelectMany: false,
    showCollapseAll: true,
  });

  commands.registerCommand("affinidiExplorer.refresh", () => {
    affExplorerTreeProvider.refresh();
  });

  let panel: WebviewPanel | undefined = undefined;

  const openSchema = commands.registerCommand(
    "schema.showSchemaDetails",
    () => {
      const selectedTreeViewItem = treeView.selection[0];

      // If no panel is open, create a new one and update the HTML
      if (!panel) {
        // @ts-ignore
        panel = window.createWebviewPanel(
          "schemaDetailView",
          selectedTreeViewItem?.label as string,
          ViewColumn.One,
          {
            enableScripts: true,
          }
        );
      }

      // If a panel is open, update the HTML with the selected item's content
      // @ts-ignore
      panel.title = selectedTreeViewItem.label;

      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionUri,
        selectedTreeViewItem
      );

      panel?.onDidDispose(
        () => {
          // When the panel is closed, cancel any future updates to the webview content
          panel = undefined;
        },
        null,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(openSchema);

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

  context.subscriptions.push(
    commands.registerCommand(
      "affinidi.copyJsonURL",
      async (treeItem: AffResourceTreeItem) => {
        const schema = await getSchema(treeItem.metadata.id as string);
        env.clipboard.writeText(schema.jsonSchemaUrl);
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      "affinidi.copyJsonLDURL",
      async (treeItem: AffResourceTreeItem) => {
        const schema = await getSchema(treeItem.metadata.id as string);
        env.clipboard.writeText(schema.jsonLdContextUrl);
      }
    )
  );

  commands.registerCommand(
    "affinidiExplorer.viewProperties",
    async (element: AffResourceTreeItem) => {
      viewProperties(element.resourceType, element.metadata);
    }
  );
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  window.showInformationMessage("Goodbye!!!");
}
