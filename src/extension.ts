import * as path from 'path'
import { commands, ExtensionContext, Uri, window, env, l10n } from 'vscode'
import { IssuanceDto } from '@affinidi/client-issuance'
import { SchemaDto } from '@affinidi/client-schema-manager'
import { AffinidiExplorerProvider } from './treeView/affinidiExplorerProvider'
import { AffinidiCodeGenProvider } from './treeView/affinidiCodeGenProvider'
import { ext } from './extensionVariables'
import { initAuthentication } from './auth/init-authentication'
import { AffResourceTreeItem } from './treeView/treeItem'
import { viewProperties, viewSchemaContent } from './services/viewDataService'
import { initSnippets } from './codegen/snippets/initSnippets'
import { initGenerators } from './codegen/apps/initGenerators'
import { viewMarkdown as getMarkdownUri } from './services/markdownService'
import { EventNames, EventSubCategory, telemetryClient } from './features/telemetry/telemetryClient'
import { ExplorerResourceTypes } from './treeView/treeTypes'
import { createProjectProcess } from './features/iam/createProjectProcess'
import { initiateIssuanceCsvFlow } from './features/issuance/csvCreationService'
import { schemaManagerClient } from './features/schema-manager/schemaManagerClient'
import { logger } from './utils/logger'
import { buildUrl } from './utils/buildUrl'
import { askUserForTelemetryConsent } from './features/telemetry/askUserForTelemetryConsent'
import { viewSchemaDetails } from './features/schema-manager/commands/viewSchemaDetails'
import { IamExplorerTreeProvider } from './features/iam/iamExplorerTreeProvider'
import { AuthExplorerTreeProvider } from './auth/authExplorerTreeProvider'
import { SchemaManagerExplorerTreeProvider } from './features/schema-manager/schemaManagerExplorerTreeProvider'
import { IssuanceExplorerTreeProvider } from './features/issuance/issuanceExplorerTreeProvider'

const CONSOLE_URL = 'https://console.affinidi.com'

export async function activateInternal(context: ExtensionContext) {
  logger.info({}, 'Activating Affinidi extension...')

  ext.context = context
  ext.outputChannel = window.createOutputChannel('Affinidi')
  ext.authProvider = initAuthentication()

  initSnippets()
  initGenerators()

  const affExplorerTreeProvider = new AffinidiExplorerProvider([
    new IamExplorerTreeProvider(),
    new AuthExplorerTreeProvider(),
    new IssuanceExplorerTreeProvider(),
    new SchemaManagerExplorerTreeProvider(),
  ])

  const affCodeGenTreeProvider = new AffinidiCodeGenProvider()

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

  commands.registerCommand('affinidiExplorer.refresh', (element: AffResourceTreeItem) => {
    let resourceType = ExplorerResourceTypes[ExplorerResourceTypes.project]
    if (
      element?.resourceType === ExplorerResourceTypes.rootSchemas ||
      element?.resourceType === ExplorerResourceTypes.rootIssuance
    ) {
      resourceType = `${element?.resourceType}`
    }

    telemetryClient.trackCommandExecution('affinidiExplorer.refresh', {
      metadata: { resourceType },
    })

    affExplorerTreeProvider.refresh()
  })

  commands.registerCommand('schema.viewSchemaDetails', () => viewSchemaDetails({ treeView }))

  context.subscriptions.push(
    commands.registerCommand('affinidi.docs.availableSnippets', async () => {
      telemetryClient.trackCommandExecution('affinidi.docs.availableSnippets')

      const uri: Uri = Uri.file(path.join(context.extensionPath, '/document/snippets.md'))
      commands.executeCommand('markdown.showPreview', uri)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.openMarkDown', async (element: AffResourceTreeItem) => {
      // TODO: get projectId
      telemetryClient.trackCommandExecution('affinidi.openMarkDown', {
        projectId: element.projectId,
        metadata: {
          resourceType: ExplorerResourceTypes[element.resourceType],
        },
      })

      const uri: Uri = Uri.file(
        path.join(context.extensionPath, getMarkdownUri(element.resourceType)),
      )

      commands.executeCommand('markdown.showPreview', uri)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.copyJsonURL', async (element: AffResourceTreeItem) => {
      telemetryClient.trackCommandExecution('affinidi.copyJsonURL', {
        projectId: element.projectId,
      })

      const schema = await schemaManagerClient.getSchema(element.metadata.id)
      if (!schema) {
        return
      }

      env.clipboard.writeText(schema.jsonSchemaUrl)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.copyJsonLdURL', async (element: AffResourceTreeItem) => {
      telemetryClient.trackCommandExecution('affinidi.copyJsonLdURL', {
        projectId: element.projectId,
      })

      const schema = await schemaManagerClient.getSchema(element.metadata.id)
      if (!schema) {
        return
      }

      env.clipboard.writeText(schema.jsonLdContextUrl)
    }),
  )

  commands.registerCommand('affinidiExplorer.viewProperties', (element: AffResourceTreeItem) => {
    viewProperties(element.resourceType, element.metadata)

    telemetryClient.trackCommandExecution('affinidiExplorer.viewProperties', {
      projectId: element.projectId,
      resource: ExplorerResourceTypes[element.resourceType],
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

        telemetryClient.sendEvent({
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

    telemetryClient.sendEvent({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.showJsonSchema',
        projectId: element.projectId,
      },
    })
  })

  commands.registerCommand('affinidiExplorer.createSchema', (element: AffResourceTreeItem) => {
    const createSchemaURL = buildUrl(CONSOLE_URL, '/schema-manager/builder')

    telemetryClient.sendEvent({
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
    const createIssuanceURL = buildUrl(CONSOLE_URL, '/bulk-issuance', {
      schemaUrl: element.metadata.jsonSchemaUrl,
    })

    telemetryClient.sendEvent({
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

    telemetryClient.sendEvent({
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

      telemetryClient.sendEvent({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.createProject',
          projectId: result?.projectId,
        },
      })
    }),
  )
  commands.registerCommand('affinidiDevTools.issueCredential', () => {
    const issueCredentialURL = buildUrl(CONSOLE_URL, '/bulk-issuance')

    telemetryClient.sendEvent({
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
