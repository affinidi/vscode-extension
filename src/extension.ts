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
import { AffinidiCodeGenProvider } from "./treeView/affinidiCodeGenProvider";
import { ext } from "./extensionVariables";
import { initAuthentication } from "./auth/init-authentication";
import { AffResourceTreeItem } from "./treeView/treeItem";
import { viewProperties, viewSchemaContent } from "./services/viewDataService";
import { getSchema } from "./services/schemaManagerService";
import { getWebviewContent } from "./ui/getWebviewContent";
import { initSnippets } from "./snippets/initSnippets";
import { viewMarkdown } from "./services/markdownService";
import { buildURL } from "./api-client/api-fetch";
import { createProjectProcess } from "./iam/iam";
import {
  EventNames,
  sendEventToAnalytics,
} from "./services/analyticsStreamApiService";

const CONSOLE_URL = "https://console.prod.affinidi.com";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activateInternal(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("Congratulations, your Affinidi extension is now active!");

  ext.context = context;
  ext.outputChannel = window.createOutputChannel("Affinidi");
  ext.authProvider = initAuthentication();

  initSnippets();

  const affExplorerTreeProvider = new AffinidiExplorerProvider();
  const affCodeGenTreeProvider = new AffinidiCodeGenProvider();

  const treeView = window.createTreeView("affinidiExplorer", {
    treeDataProvider: affExplorerTreeProvider,
    canSelectMany: false,
    showCollapseAll: true,
  });

  window.createTreeView("affinidiCodeGeneration", {
    treeDataProvider: affCodeGenTreeProvider,
    canSelectMany: false,
    showCollapseAll: true,
  });

  commands.registerCommand("affinidiExplorer.refresh", () => {
    affExplorerTreeProvider.refresh();

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: "refresh",
      metadata: {
        commandId: "affinidiExplorer.refresh",
      },
    });
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

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "schema",
        metadata: {
          commandId: "schema.showSchemaDetails",
        },
      });
    }
  );

  context.subscriptions.push(openSchema);

  context.subscriptions.push(
    commands.registerCommand("affinidi.docs.availableSnippets", async () => {
      let uri: Uri = Uri.file(
        path.join(context.extensionPath, "/document/snippets.md")
      );

      commands.executeCommand("markdown.showPreview", uri);

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "about:snippets",
        metadata: {
          commandId: "affinidi.docs.availableSnippets",
        },
      });
    })
  );

  context.subscriptions.push(
    commands.registerCommand(
      "affinidi.openMarkDown",
      async (element: AffResourceTreeItem) => {
        let uri: Uri = Uri.file(
          path.join(
            context.extensionPath,
            `${await viewMarkdown(element.resourceType)}`
          )
        );

        commands.executeCommand("markdown.showPreview", uri);

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: `about:${element.resourceType}`,
          metadata: {
            commandId: "affinidi.openMarkDown",
          },
        });
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      "affinidi.copyJsonURL",
      async (treeItem: AffResourceTreeItem) => {
        const schema = await getSchema(treeItem.metadata.id as string);
        env.clipboard.writeText(schema.jsonSchemaUrl);

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: "schema",
          metadata: {
            commandId: "affinidi.copyJsonURL",
          },
        });
      }
    )
  );

  context.subscriptions.push(
    commands.registerCommand(
      "affinidi.copyJsonLdURL",
      async (treeItem: AffResourceTreeItem) => {
        const schema = await getSchema(treeItem.metadata.id as string);
        env.clipboard.writeText(schema.jsonLdContextUrl);

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: "schema",
          metadata: {
            commandId: "affinidi.copyJsonLdURL",
          },
        });
      }
    )
  );

  commands.registerCommand(
    "affinidiExplorer.viewProperties",
    (element: AffResourceTreeItem) => {
      viewProperties(element.resourceType, element.metadata);

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: `properties:${element.resourceType}`,
        metadata: {
          commandId: "affinidiExplorer.viewProperties",
        },
      });
    }
  );

  commands.registerCommand(
    "affinidiExplorer.showJsonSchema",
    (element: AffResourceTreeItem) => {
      viewSchemaContent(element.metadata.id, element.metadata.jsonSchemaUrl);

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "schema",
        metadata: {
          commandId: "affinidiExplorer.showJsonSchema",
        },
      });
    }
  );

  commands.registerCommand("affinidiExplorer.createSchema", () => {
    const createSchemaURL = buildURL(CONSOLE_URL, "/schema-manager/builder");

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: "schema",
      metadata: {
        commandId: "affinidiExplorer.createSchema",
      },
    });

    commands.executeCommand("vscode.open", createSchemaURL);
  });

  commands.registerCommand(
    "affinidiExplorer.createIssuance",
    (element: AffResourceTreeItem) => {
      const createIssuanceURL = buildURL(CONSOLE_URL, "/bulk-issuance", {
        schemaUrl: element.metadata.jsonSchemaUrl,
      });

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "vc",
        metadata: {
          commandId: "affinidiExplorer.createIssuance",
        },
      });

      commands.executeCommand("vscode.open", createIssuanceURL);
    }
  );

  commands.registerCommand(
    "affinidiExplorer.showJsonLdContext",
    (element: AffResourceTreeItem) => {
      viewSchemaContent(
        element.metadata.id,
        element.metadata.jsonLdContextUrl,
        ".jsonld"
      );

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "schema",
        metadata: {
          commandId: "affinidiExplorer.showJsonLdContext",
        },
      });
    }
  );

  context.subscriptions.push(
    commands.registerCommand("affinidi.createProject", async () => {
      await createProjectProcess();
      affExplorerTreeProvider.refresh();

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "project",
        metadata: {
          commandId: "affinidi.createProject",
        },
      });
    })
  );
  commands.registerCommand("affinidiDevTools.issueCredential", () => {
    const issueCredentialURL = buildURL(CONSOLE_URL, "/bulk-issuance");

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: "vc",
      metadata: {
        commandId: "affinidiDevTools.issueCredential",
      },
    });

    commands.executeCommand("vscode.open", issueCredentialURL);
  });
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  window.showInformationMessage("Goodbye!!!");
}
