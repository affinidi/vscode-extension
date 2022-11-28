/* eslint-disable @typescript-eslint/consistent-type-assertions */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path'
import {
  commands,
  ExtensionContext,
  Uri,
  window,
  env,
  ViewColumn,
  WebviewPanel,
  l10n,
} from 'vscode'
import { IssuanceDto } from '@affinidi/client-issuance'
import { SchemaDto } from '@affinidi/client-schema-manager'
import { AffinidiExplorerProvider } from './treeView/affinidiExplorerProvider'
import { AffinidiCodeGenProvider } from './treeView/affinidiCodeGenProvider'
import { ext } from './extensionVariables'
import { initAuthentication } from './auth/init-authentication'
import { AffResourceTreeItem } from './treeView/treeItem'
import { viewProperties, viewSchemaContent } from './services/viewDataService'
import { getWebviewContent } from './ui/getWebviewContent'
import { initSnippets } from './snippets/initSnippets'
import { initGenerators } from './generators/initGenerators'
import { viewMarkdown } from './services/markdownService'
import { buildURL } from './api-client/api-fetch'
import {
  EventNames,
  EventSubCategory,
  sendEventToAnalytics,
} from './services/analyticsStreamApiService'
import { askUserForTelemetryConsent } from './utils/telemetry'
import { ExplorerResourceTypes } from './treeView/treeTypes'
import { createProjectProcess } from './features/iam/createProjectProcess'
import { initiateIssuanceCsvFlow } from './features/issuance/csvCreationService'
import { schemaManagerClient } from './features/schema-manager/schemaManagerClient'
import { logger } from './utils/logger'
import { AffinidiFeedbackProvider } from './treeView/affinidiFeedbackProvider'

const CONSOLE_URL = 'https://console.affinidi.com'
const GITHUB_URL = 'https://github.com/affinidi/vscode-extension/issues'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activateInternal(context: ExtensionContext) {
  logger.info({}, 'Activating Affinidi extension...')

  ext.context = context
  ext.outputChannel = window.createOutputChannel('Affinidi')
  ext.authProvider = initAuthentication()

  initSnippets()
  initGenerators()

  const affExplorerTreeProvider = new AffinidiExplorerProvider()
  const affCodeGenTreeProvider = new AffinidiCodeGenProvider()
  const affFeedbackProvider = new AffinidiFeedbackProvider()

  const treeView = window.createTreeView('affinidiExplorer', {
    treeDataProvider: affExplorerTreeProvider,
    canSelectMany: false,
    showCollapseAll: true,
  })

  window.createTreeView('affinidiCodeGeneration', {
    treeDataProvider: affCodeGenTreeProvider,
    canSelectMany: false,
    showCollapseAll: true,
  })

  window.createTreeView('affinidiFeedback', {
    treeDataProvider: affFeedbackProvider,
    canSelectMany: false,
    showCollapseAll: true,
  })

  commands.registerCommand('affinidiExplorer.refresh', (element: AffResourceTreeItem) => {
    affExplorerTreeProvider.refresh()

    let resourceType = ExplorerResourceTypes[ExplorerResourceTypes.project]
    if (
      element?.resourceType === ExplorerResourceTypes.rootSchemas ||
      element?.resourceType === ExplorerResourceTypes.rootIssuance
    ) {
      resourceType = `${element?.resourceType}`
    }

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.refresh',
        resourceType,
        projectId: element?.projectId,
      },
    })
  })

  let panel: WebviewPanel | undefined

  const openSchema = commands.registerCommand('schema.showSchemaDetails', () => {
    const selectedTreeViewItem = treeView.selection[0]

    // If no panel is open, create a new one and update the HTML
    if (!panel) {
      panel = window.createWebviewPanel(
        'schemaDetailView',
        selectedTreeViewItem?.label as string,
        ViewColumn.One,
        {
          enableScripts: true,
        },
      )
    }

    // If a panel is open, update the HTML with the selected item's content
    panel.title = selectedTreeViewItem.label as string

    panel.webview.html = getWebviewContent(
      panel.webview,
      context.extensionUri,
      selectedTreeViewItem,
    )

    panel?.onDidDispose(
      () => {
        // When the panel is closed, cancel any future updates to the webview content
        panel = undefined
      },
      null,
      context.subscriptions,
    )

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'schema.showSchemaDetails',
        projectId: selectedTreeViewItem.projectId,
      },
    })
  })

  context.subscriptions.push(openSchema)

  context.subscriptions.push(
    commands.registerCommand('affinidi.docs.availableSnippets', async () => {
      const uri: Uri = Uri.file(path.join(context.extensionPath, '/document/snippets.md'))

      commands.executeCommand('markdown.showPreview', uri)
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.docs.availableSnippets',
        },
      })
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.openMarkDown', async (element: AffResourceTreeItem) => {
      const uri: Uri = Uri.file(
        path.join(context.extensionPath, `${await viewMarkdown(element.resourceType)}`),
      )

      commands.executeCommand('markdown.showPreview', uri)

      // TODO: get projectId
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.openMarkDown',
          projectId: element.projectId,
          resourceType: `${element.resourceType}`,
        },
      })
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.copyJsonURL', async (element: AffResourceTreeItem) => {
      const schema = await schemaManagerClient.getSchema(element.metadata.id as string)
      if (!schema) {
        return
      }

      env.clipboard.writeText(schema.jsonSchemaUrl)

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.copyJsonURL',
          projectId: element.projectId,
        },
      })
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.copyJsonLdURL', async (element: AffResourceTreeItem) => {
      const schema = await schemaManagerClient.getSchema(element.metadata.id as string)
      if (!schema) {
        return
      }

      env.clipboard.writeText(schema.jsonLdContextUrl)

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.copyJsonLdURL',
          projectId: element.projectId,
        },
      })
    }),
  )

  commands.registerCommand('affinidiExplorer.viewProperties', (element: AffResourceTreeItem) => {
    viewProperties(element.resourceType, element.metadata)

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.viewProperties',
        projectId: element.projectId,
        resource: `${element.resourceType}`,
      },
    })
  })

  context.subscriptions.push(
    commands.registerCommand(
      'affinidiExplorer.initiateIssuanceCsvFlow',
      async (element: AffResourceTreeItem) => {
        const { projectId } = element
        if (!projectId) return

        if (element.resourceType === ExplorerResourceTypes.schema) {
          const schema: SchemaDto = element.metadata
          await initiateIssuanceCsvFlow({ projectId, schema })
        } else if (element.resourceType === ExplorerResourceTypes.issuance) {
          const issuance: IssuanceDto = element.metadata
          await initiateIssuanceCsvFlow({ projectId, schema: issuance.template.schema })
        }

        sendEventToAnalytics({
          name: EventNames.commandExecuted,
          subCategory: EventSubCategory.command,
          metadata: {
            commandId: 'affinidiExplorer.initiateIssuanceCsvFlow',
          },
        })
      },
    ),
  )

  commands.registerCommand('affinidiExplorer.showJsonSchema', (element: AffResourceTreeItem) => {
    viewSchemaContent(element.metadata.id, element.metadata.jsonSchemaUrl)

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.showJsonSchema',
        projectId: element.projectId,
      },
    })
  })

  commands.registerCommand('affinidiExplorer.createSchema', (element: AffResourceTreeItem) => {
    const createSchemaURL = buildURL(CONSOLE_URL, '/schema-manager/builder')

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.createSchema',
        projectId: element?.projectId,
      },
    })

    commands.executeCommand('vscode.open', createSchemaURL)
  })

  commands.registerCommand('affinidiExplorer.createIssuance', (element: AffResourceTreeItem) => {
    const createIssuanceURL = buildURL(CONSOLE_URL, '/bulk-issuance', {
      schemaUrl: element.metadata.jsonSchemaUrl,
    })

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.createIssuance',
        projectId: element.projectId,
      },
    })

    commands.executeCommand('vscode.open', createIssuanceURL)
  })

  commands.registerCommand('affinidiExplorer.showJsonLdContext', (element: AffResourceTreeItem) => {
    viewSchemaContent(element.metadata.id, element.metadata.jsonLdContextUrl, '.jsonld')

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.showJsonLdContext',
        projectId: element.projectId,
      },
    })
  })

  context.subscriptions.push(
    commands.registerCommand('affinidi.createProject', async () => {
      const result = await createProjectProcess()

      affExplorerTreeProvider.refresh()

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.createProject',
          projectId: result?.projectId,
        },
      })
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidiFeedback.redirectToGithub', () => {
      commands.executeCommand('vscode.open', GITHUB_URL)
    }),
  )

  commands.registerCommand('affinidiDevTools.issueCredential', () => {
    const issueCredentialURL = buildURL(CONSOLE_URL, '/bulk-issuance')

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiDevTools.issueCredential',
      },
    })

    commands.executeCommand('vscode.open', issueCredentialURL)
  })

  askUserForTelemetryConsent()

  logger.info({}, 'Affinidi extension is now active!')
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  window.showInformationMessage(l10n.t('Goodbye!!!'))
}
