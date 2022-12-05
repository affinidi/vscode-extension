/* eslint-disable @typescript-eslint/consistent-type-assertions */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path'
import { commands, ExtensionContext, Uri, window, env, l10n } from 'vscode'
import { ext } from './extensionVariables'
import { initAuthentication } from './auth/init-authentication'
import { showElementProperties } from './features/showElementProperties'
import { initSnippets } from './snippets/initSnippets'
import { initGenerators } from './generators/initGenerators'
import { getFeatureMarkdownUri } from './features/getFeatureMarkdownUri'
import { buildURL } from './api-client/api-fetch'
import {
  EventNames,
  EventSubCategory,
  sendEventToAnalytics,
} from './services/analyticsStreamApiService'
import { askUserForTelemetryConsent } from './utils/telemetry'
import { createProjectProcess } from './features/iam/createProjectProcess'
import { csvCreationService } from './features/issuance/csvCreationService'
import { logger } from './utils/logger'
import { ExplorerTree } from './tree/explorerTree'
import { AuthExplorerProvider } from './auth/authExplorerProvider'
import { IssuanceExplorerProvider } from './features/issuance/tree/issuanceExplorerProvider'
import { SchemaManagerExplorerProvider } from './features/schema-manager/tree/schemaManagerExplorerProvider'
import { openSchemaBuilder } from './features/schema-manager/schema-builder/openSchemaBuilder'
import { schemaManagerHelpers } from './features/schema-manager/schemaManagerHelpers'
import { iamHelpers } from './features/iam/iamHelpers'
import { showSchemaDetails } from './features/schema-manager/schema-details/showSchemaDetails'
import { issuanceState } from './features/issuance/issuanceState'
import { schemaManagerState } from './features/schema-manager/schemaManagerState'
import { state } from './state'
import { CodegenTree } from './tree/codegenTree'
import { FeedbackTree } from './tree/feedbackTree'
import { IamExplorerProvider } from './features/iam/tree/iamExplorerProvider'
import { BasicTreeItem } from './tree/basicTreeItem'
import { ProjectFeatureTreeItem } from './features/iam/tree/treeItems'
import { Feature } from './features/feature'
import { iamState } from './features/iam/iamState'
import { BasicTreeItemWithProject } from './tree/basicTreeItemWithProject'
import { SchemaTreeItem, ScopedSchemasTreeItem } from './features/schema-manager/tree/treeItems'
import { IssuanceTreeItem } from './features/issuance/tree/treeItems'

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

  ext.explorerTree = new ExplorerTree([
    new AuthExplorerProvider(),
    new IamExplorerProvider(),
    new IssuanceExplorerProvider(),
    new SchemaManagerExplorerProvider(),
  ])
  ext.codegenTree = new CodegenTree()
  ext.feedbackTree = new FeedbackTree()

  const treeView = window.createTreeView('affinidiExplorer', {
    treeDataProvider: ext.explorerTree,
    canSelectMany: false,
    showCollapseAll: true,
  })

  window.createTreeView('affinidiCodeGeneration', {
    treeDataProvider: ext.codegenTree,
    canSelectMany: false,
    showCollapseAll: true,
  })

  window.createTreeView('affinidiFeedback', {
    treeDataProvider: ext.feedbackTree,
    canSelectMany: false,
    showCollapseAll: true,
  })

  commands.registerCommand('affinidiExplorer.refresh', async (element: BasicTreeItem) => {
    if (element instanceof ProjectFeatureTreeItem) {
      if (element.feature === Feature.DIGITAL_IDENTITIES) {
        await iamState.clear()
      } else if (element.feature === Feature.ISSUANCES) {
        await issuanceState.clear()
      } else if (element.feature === Feature.SCHEMAS) {
        await schemaManagerState.clear()
      }
    } else {
      await state.clear()
    }

    ext.explorerTree.refresh(element)

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.refresh',
        feature: element instanceof ProjectFeatureTreeItem ? element.feature : undefined,
        projectId: element instanceof BasicTreeItemWithProject ? element.projectId : undefined,
      },
    })
  })

  const openSchema = commands.registerCommand('schema.showSchemaDetails', async () => {
    const element = treeView.selection[0] as SchemaTreeItem
    const schema = await schemaManagerState.getAuthoredSchemaById({
      projectId: element.projectId,
      schemaId: element.schemaId,
    })
    if (!schema) return

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'schema.showSchemaDetails',
        projectId: element.projectId,
      },
    })

    showSchemaDetails(schema)
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
    commands.registerCommand('affinidi.openMarkDown', async (element: ProjectFeatureTreeItem) => {
      const uri: Uri = Uri.file(
        path.join(context.extensionPath, await getFeatureMarkdownUri(element.feature)),
      )

      commands.executeCommand('markdown.showPreview', uri)

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.openMarkDown',
          feature: element.feature,
          projectId: element.projectId,
        },
      })
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.copyJsonURL', async (element: SchemaTreeItem) => {
      const schema = await schemaManagerState.getAuthoredSchemaById({
        projectId: element.projectId,
        schemaId: element.schemaId,
      })

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
    commands.registerCommand('affinidi.copyJsonLdURL', async (element: SchemaTreeItem) => {
      const schema = await schemaManagerState.getAuthoredSchemaById({
        projectId: element.projectId,
        schemaId: element.schemaId,
      })

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

  commands.registerCommand(
    'affinidiExplorer.viewProperties',
    (element: BasicTreeItemWithProject) => {
      showElementProperties(element)

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidiExplorer.viewProperties',
          projectId: element.projectId,
          resource: element.contextValue,
        },
      })
    },
  )

  context.subscriptions.push(
    commands.registerCommand(
      'affinidiExplorer.initiateIssuanceCsvFlow',
      async (element: BasicTreeItemWithProject) => {
        const { projectId } = element
        if (!projectId) return

        if (element instanceof SchemaTreeItem) {
          const schema = await schemaManagerState.getAuthoredSchemaById({
            projectId: element.projectId,
            schemaId: element.schemaId,
          })

          if (schema) {
            await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })
          }
        } else if (element instanceof IssuanceTreeItem) {
          const issuance = await issuanceState.getIssuanceById({
            projectId: element.projectId,
            issuanceId: element.issuanceId,
          })

          if (issuance) {
            await csvCreationService.initiateIssuanceCsvFlow({
              projectId,
              schema: issuance.template.schema,
            })
          }
        } else if (
          element instanceof ProjectFeatureTreeItem &&
          element.feature === Feature.ISSUANCES
        ) {
          const schema = await schemaManagerHelpers.askForAuthoredSchema({
            projectId,
            includeExample: true,
          })
          if (!schema) return

          await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })
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

  commands.registerCommand('affinidiExplorer.showJsonSchema', async (element: SchemaTreeItem) => {
    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.showJsonSchema',
        projectId: element.projectId,
      },
    })

    const schema = await schemaManagerState.getAuthoredSchemaById({
      projectId: element.projectId,
      schemaId: element.schemaId,
    })
    if (!schema) return

    await schemaManagerHelpers.showSchemaFile(schema, 'json')
  })

  commands.registerCommand('affinidiExplorer.openCreateSchemaUrl', (element: BasicTreeItem) => {
    const createSchemaURL = buildURL(CONSOLE_URL, '/schema-manager/builder')

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.openCreateSchemaUrl',
        projectId: element instanceof BasicTreeItemWithProject ? element.projectId : undefined,
      },
    })

    commands.executeCommand('vscode.open', createSchemaURL)
  })

  commands.registerCommand('affinidiExplorer.createIssuance', async (element: SchemaTreeItem) => {
    const schema = await schemaManagerState.getAuthoredSchemaById({
      projectId: element.projectId,
      schemaId: element.schemaId,
    })

    if (schema) {
      const createIssuanceURL = buildURL(CONSOLE_URL, '/bulk-issuance', {
        schemaUrl: schema.jsonSchemaUrl,
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
    }
  })

  commands.registerCommand('affinidiExplorer.createIssuanceWithSchema', async () => {
    const projectId = await iamHelpers.askForProjectId()
    if (!projectId) return

    const jsonSchemaUrl = await schemaManagerHelpers.fetchSchemaUrl(projectId)
    const createIssuanceURL = buildURL(CONSOLE_URL, '/bulk-issuance', {
      schemaUrl: jsonSchemaUrl,
    })

    commands.executeCommand('vscode.open', createIssuanceURL)

    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidiExplorer.createIssuanceWithSchema',
        projectId,
      },
    })
  })

  commands.registerCommand(
    'affinidiExplorer.showJsonLdContext',
    async (element: SchemaTreeItem) => {
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidiExplorer.showJsonLdContext',
          projectId: element.projectId,
        },
      })

      const schema = await schemaManagerState.getAuthoredSchemaById({
        projectId: element.projectId,
        schemaId: element.schemaId,
      })
      if (!schema) return

      await schemaManagerHelpers.showSchemaFile(schema, 'jsonld')
    },
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.createProject', async () => {
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.createProject',
        },
      })

      await createProjectProcess()
      ext.explorerTree.refresh()
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

  commands.registerCommand(
    'affinidiExplorer.openSchemaBuilder',
    async (element: BasicTreeItemWithProject) => {
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidiExplorer.openSchemaBuilder',
        },
      })

      openSchemaBuilder({
        projectId: element.projectId,
        scope: element instanceof ScopedSchemasTreeItem ? element.scope : 'public',
      })
    },
  )

  commands.registerCommand(
    'affinidiExplorer.forkSchema',
    async (element: SchemaTreeItem) => {
      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidiExplorer.forkSchema',
        },
      })

      openSchemaBuilder({
        parentSchemaId: element.schemaId,
        projectId: element.projectId,
      })
    },
  )

  commands.registerCommand('affinidi.openSchemaBuilder', async () => {
    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidi.openSchemaBuilder',
      },
    })

    openSchemaBuilder({ projectId: await iamHelpers.askForProjectId() })
  })

  askUserForTelemetryConsent()

  logger.info({}, 'Affinidi extension is now active!')
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  window.showInformationMessage(l10n.t('Goodbye!!!'))
}
