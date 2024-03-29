/* eslint-disable @typescript-eslint/consistent-type-assertions */
import path from 'path'
import { commands, ExtensionContext, Uri, window, env, workspace, languages } from 'vscode'
import { ext } from './extensionVariables'
import { initAuthentication } from './auth/init-authentication'
import { showElementProperties } from './features/showElementProperties'
import { initSnippets } from './snippets/initSnippets'
import { initGenerators } from './generators/initGenerators'
import { getFeatureMarkdownUri } from './features/getFeatureMarkdownUri'
import { csvCreationService } from './features/issuance/csvCreationService'
import { logger } from './utils/logger'
import { ExplorerTree } from './tree/explorerTree'
import { AuthExplorerProvider } from './auth/authExplorerProvider'
import { IssuanceExplorerProvider } from './features/issuance/tree/issuanceExplorerProvider'
import { SchemaManagerExplorerProvider } from './features/schema-manager/tree/schemaManagerExplorerProvider'
import { openSchemaBuilder } from './features/schema-manager/schema-builder/openSchemaBuilder'
import { schemaManagerHelpers } from './features/schema-manager/schemaManagerHelpers'
import { showSchemaDetails } from './features/schema-manager/schema-details/showSchemaDetails'
import { issuanceState } from './features/issuance/issuanceState'
import { schemaManagerState } from './features/schema-manager/schemaManagerState'
import { state } from './state'
import { DevToolsTree } from './tree/devToolsTree'
import { FeedbackTree } from './tree/feedbackTree'
import { IamExplorerProvider } from './features/iam/tree/iamExplorerProvider'
import { BasicTreeItem } from './tree/basicTreeItem'
import { ProjectFeatureTreeItem } from './features/iam/tree/treeItems'
import { Feature } from './features/feature'
import { iamState } from './features/iam/iamState'
import { BasicTreeItemWithProject } from './tree/basicTreeItemWithProject'
import { SchemaTreeItem, ScopedSchemasTreeItem } from './features/schema-manager/tree/treeItems'
import { IssuanceTreeItem } from './features/issuance/tree/treeItems'
import { configVault } from './config/configVault'
import { updateCredentialsActiveProjectSummary } from './config/updateCredentialsActiveProjectSummary'
import { telemetryHelpers } from './features/telemetry/telemetryHelpers'
import { verifyVC } from './features/verifier/verifyVC'
import { initIam } from './features/iam/initIam'
import { notifyError } from './utils/notifyError'
import { schemaMessage } from './features/schema-manager/messages'
import { IS_LOCAL } from './utils/env'
import { initDevelopment } from './features/development/initDevelopment'
import { iamHelpers } from './features/iam/iamHelpers'
import { AffinidiDragAndDropProvider } from './tree/dragAndDrop'

const GITHUB_ISSUES_URL = 'https://github.com/affinidi/vscode-extension/issues'
const GITHUB_NEW_ISSUE_URL = 'https://github.com/affinidi/vscode-extension/issues/new'
const API_DOCS_URL = 'https://build.affinidi.com/docs/api'
const DISCORD_URL = 'https://discord.com/invite/jx2hGBk5xE'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activateInternal(context: ExtensionContext) {
  logger.info({}, 'Activating Affinidi extension...')

  const dragAndDropProvider = new AffinidiDragAndDropProvider()

  ext.context = context
  ext.outputChannel = window.createOutputChannel('Affinidi')
  ext.authProvider = initAuthentication()

  ext.explorerTree = new ExplorerTree([
    new AuthExplorerProvider(),
    new IamExplorerProvider(),
    new IssuanceExplorerProvider(),
    new SchemaManagerExplorerProvider(),
  ])
  ext.devToolsTree = new DevToolsTree()
  ext.feedbackTree = new FeedbackTree()

  ext.context.subscriptions.push(
    ext.authProvider.onDidChangeSessions(async () => {
      state.clear()
      ext.explorerTree.refresh()
    }),
    {
      dispose: configVault.onUserConfigChange(async (newConfig, oldConfig) => {
        state.clear()
        ext.explorerTree.refresh()

        if (newConfig?.activeProjectId !== oldConfig?.activeProjectId) {
          updateCredentialsActiveProjectSummary()
        }
      }),
    },
    {
      dispose: configVault.onCurrentUserIdChange(async () => {
        state.clear()
        ext.explorerTree.refresh()

        updateCredentialsActiveProjectSummary()
      }),
    },
  )

  const treeView = window.createTreeView('affinidiExplorer', {
    treeDataProvider: ext.explorerTree,
    canSelectMany: false,
    showCollapseAll: true,
    dragAndDropController: dragAndDropProvider,
  })

  window.createTreeView('affinidiDevTools', {
    treeDataProvider: ext.devToolsTree,
    canSelectMany: false,
    showCollapseAll: true,
    dragAndDropController: dragAndDropProvider,
  })

  const feedbackTreeView = window.createTreeView('affinidiFeedback', {
    treeDataProvider: ext.feedbackTree,
    canSelectMany: false,
    showCollapseAll: true,
  })

  feedbackTreeView.onDidChangeVisibility((ev) => {
    const walkthroughOpened = workspace.getConfiguration().get('affinidi.walkthrough.opened')

    if (!walkthroughOpened && ev.visible) {
      commands.executeCommand(
        'workbench.action.openWalkthrough',
        'Affinidi.affinidi#affinidi-walkthrough',
      )
      workspace.getConfiguration().update('affinidi.walkthrough.opened', true, true)
    }
  })

  workspace.onDidChangeConfiguration((event) => {
    const affected = event.affectsConfiguration('affinidi.telemetry.enabled')
    if (affected) {
      telemetryHelpers.registerTelemetryChanged()
    }
  })

  context.subscriptions.push(
    commands.registerCommand('affinidiExplorer.refreshAll', () => {
      telemetryHelpers.trackCommand('affinidiExplorer.refreshAll')
      state.clear()
      ext.explorerTree.refresh()
    }),
  )

  commands.registerCommand('affinidiExplorer.refresh', (element: BasicTreeItem) => {
    telemetryHelpers.trackCommand('affinidiExplorer.refresh', {
      feature: element instanceof ProjectFeatureTreeItem ? element.feature : undefined,
      projectId: element instanceof BasicTreeItemWithProject ? element.projectId : undefined,
    })

    if (element instanceof ProjectFeatureTreeItem) {
      if (element.feature === Feature.DIGITAL_IDENTITIES) {
        iamState.clear()
      } else if (element.feature === Feature.ISSUANCES) {
        issuanceState.clear()
      } else if (element.feature === Feature.SCHEMAS) {
        schemaManagerState.clear()
      }
    } else {
      state.clear()
    }

    ext.explorerTree.refresh(element)
  })

  const openSchema = commands.registerCommand('schema.showSchemaDetails', async () => {
    const element = treeView.selection[0] as SchemaTreeItem
    telemetryHelpers.trackCommand('schema.showSchemaDetails', {
      projectId: element.projectId,
    })

    const schema = await schemaManagerState.getAuthoredSchemaById({
      projectId: element.projectId,
      schemaId: element.schemaId,
    })
    if (!schema) return

    showSchemaDetails({ schema, projectId: element.projectId })
  })

  context.subscriptions.push(openSchema)

  context.subscriptions.push(
    commands.registerCommand('affinidi.docs.availableSnippets', async () => {
      telemetryHelpers.trackCommand('affinidi.docs.availableSnippets')

      const uri: Uri = Uri.file(path.join(context.extensionPath, '/document/snippets.md'))

      commands.executeCommand('markdown.showPreview', uri)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.openMarkDown', async (element: ProjectFeatureTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.openMarkDown', {
        feature: element.feature,
        projectId: element.projectId,
      })

      const uri: Uri = Uri.file(
        path.join(context.extensionPath, await getFeatureMarkdownUri(element.feature)),
      )

      commands.executeCommand('markdown.showPreview', uri)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.copyJsonURL', async (element: SchemaTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.copyJsonURL', {
        projectId: element.projectId,
      })

      const schema = await schemaManagerState.getAuthoredSchemaById({
        projectId: element.projectId,
        schemaId: element.schemaId,
      })

      if (!schema) {
        return
      }

      env.clipboard.writeText(schema.jsonSchemaUrl)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.copyJsonLdURL', async (element: SchemaTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.copyJsonLdURL', {
        projectId: element.projectId,
      })

      const schema = await schemaManagerState.getAuthoredSchemaById({
        projectId: element.projectId,
        schemaId: element.schemaId,
      })

      if (!schema) {
        return
      }

      env.clipboard.writeText(schema.jsonLdContextUrl)
    }),
  )

  commands.registerCommand(
    'affinidiExplorer.viewProperties',
    (element: BasicTreeItemWithProject) => {
      telemetryHelpers.trackCommand('affinidiExplorer.viewProperties', {
        projectId: element.projectId,
        resource: element.contextValue,
      })

      showElementProperties(element)
    },
  )

  commands.registerCommand(
    'affinidiExplorer.renameProject',
    async (element: BasicTreeItemWithProject) => {
      telemetryHelpers.trackCommand('affinidiExplorer.renameProject', {
        projectId: element.projectId,
      })

      await iamHelpers.renameProject({ projectId: element.projectId })
    },
  )

  context.subscriptions.push(
    commands.registerCommand(
      'affinidiExplorer.initiateIssuanceCsvFlow',
      async (element: BasicTreeItemWithProject) => {
        const { projectId } = element
        if (!projectId) return

        telemetryHelpers.trackCommand('affinidiExplorer.initiateIssuanceCsvFlow', { projectId })

        if (element instanceof SchemaTreeItem) {
          const schema = await schemaManagerState.getAuthoredSchemaById({
            projectId: element.projectId,
            schemaId: element.schemaId,
          })

          if (schema) {
            await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })
            telemetryHelpers.trackCommand('affinidiExplorer.initiateIssuanceCsvFlow.completed', {
              projectId,
            })
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
            telemetryHelpers.trackCommand('affinidiExplorer.initiateIssuanceCsvFlow.completed', {
              projectId,
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
          telemetryHelpers.trackCommand('affinidiExplorer.initiateIssuanceCsvFlow.completed', {
            projectId,
          })
        }
      },
    ),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidi.initiateIssuanceCsvFlow', async () => {
      telemetryHelpers.trackCommand('affinidi.initiateIssuanceCsvFlow')

      await csvCreationService.initiateIssuanceCsvFlow({})
      telemetryHelpers.trackCommand('affinidiExplorer.initiateIssuanceCsvFlow.completed', {})
    }),
  )

  commands.registerCommand('affinidiExplorer.showJsonSchema', async (element: SchemaTreeItem) => {
    telemetryHelpers.trackCommand('affinidiExplorer.showJsonSchema', {
      projectId: element.projectId,
    })

    const schema = await schemaManagerState.getAuthoredSchemaById({
      projectId: element.projectId,
      schemaId: element.schemaId,
    })
    if (!schema) return

    await schemaManagerHelpers.showSchemaFile(schema, 'json')
  })

  commands.registerCommand(
    'affinidiExplorer.showJsonLdContext',
    async (element: SchemaTreeItem) => {
      telemetryHelpers.trackCommand('affinidiExplorer.showJsonLdContext', {
        projectId: element.projectId,
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
    commands.registerCommand('affinidiFeedback.reportIssue', () => {
      telemetryHelpers.trackCommand('affinidiFeedback.reportIssue')
      commands.executeCommand('vscode.open', GITHUB_NEW_ISSUE_URL)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidiFeedback.reviewIssues', () => {
      telemetryHelpers.trackCommand('affinidiFeedback.reviewIssues')
      commands.executeCommand('vscode.open', GITHUB_ISSUES_URL)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidiFeedback.openAPIDocs', () => {
      telemetryHelpers.trackCommand('affinidiFeedback.openAPIDocs')
      commands.executeCommand('vscode.open', API_DOCS_URL)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidiFeedback.openDiscord', () => {
      telemetryHelpers.trackCommand('affinidiFeedback.openDiscord')
      commands.executeCommand('vscode.open', DISCORD_URL)
    }),
  )

  context.subscriptions.push(
    commands.registerCommand('affinidiFeedback.openWalkthrough', () => {
      telemetryHelpers.trackCommand('affinidiFeedback.openWalkthrough')
      commands.executeCommand(
        'workbench.action.openWalkthrough',
        'Affinidi.affinidi#affinidi-walkthrough',
      )
    }),
  )

  commands.registerCommand(
    'affinidiExplorer.openSchemaBuilder',
    async (element: BasicTreeItemWithProject) => {
      telemetryHelpers.trackCommand('affinidiExplorer.openSchemaBuilder')

      openSchemaBuilder({
        projectId: element.projectId,
        scope: element instanceof ScopedSchemasTreeItem ? element.scope : 'public',
      })
      telemetryHelpers.trackCommand('affinidiExplorer.schemaCreated')
    },
  )

  commands.registerCommand('affinidiExplorer.forkSchema', async (element: SchemaTreeItem) => {
    telemetryHelpers.trackCommand('affinidiExplorer.forkSchema')

    openSchemaBuilder({
      parentSchemaId: element.schemaId,
      projectId: element.projectId,
    })
  })

  commands.registerCommand('affinidi.openSchemaBuilder', async () => {
    telemetryHelpers.trackCommand('affinidi.openSchemaBuilder')
    try {
      await openSchemaBuilder({ projectId: await configVault.requireActiveProjectId() })
    } catch (error: unknown) {
      notifyError(error, schemaMessage.unableToOpenSchemaBuilder)
    }
  })

  commands.registerCommand('affinidi.verifyVC', async () => {
    telemetryHelpers.trackCommand('affinidi.verifyVC')

    await verifyVC()
  })

  telemetryHelpers.askUserForTelemetryConsent()
  updateCredentialsActiveProjectSummary()

  context.subscriptions.push(
    languages.registerDocumentDropEditProvider({ language: '*' }, dragAndDropProvider),
  )
  initSnippets()
  initGenerators()
  initIam()
  if (IS_LOCAL) initDevelopment()

  logger.info({}, 'Affinidi extension is now active!')
}

// This method is called when your extension is deactivated
export async function deactivateInternal() {
  logger.info({}, 'Affinidi extension was deactivated!')
}
