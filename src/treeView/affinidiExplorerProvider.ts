/* eslint-disable no-underscore-dangle */
import {
  Command,
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  l10n,
} from 'vscode'
import { ExplorerResourceTypes } from './treeTypes'
import { AffResourceTreeItem } from './treeItem'
import { ext } from '../extensionVariables'
import { formatIssuanceName } from '../features/issuance/formatIssuanceName'
import { projectsState } from '../states/projectsState'
import { authHelper } from '../auth/authHelper'
import { iamClient } from '../features/iam/iamClient'
import { requireProjectSummary } from '../features/iam/requireProjectSummary'
import { issuanceClient } from '../features/issuance/issuanceClient'
import { schemaManagerClient } from '../features/schema-manager/schemaManagerClient'

const isSignedIn = async () => {
  const session = await ext.authProvider.getActiveSession({
    createIfNone: false,
  })
  return !!session
}

export class AffinidiExplorerProvider implements TreeDataProvider<AffResourceTreeItem> {
  private readonly _onDidChangeTreeData: EventEmitter<AffResourceTreeItem | undefined | void> =
    new EventEmitter<AffResourceTreeItem | undefined | void>()

  readonly onDidChangeTreeData: Event<AffResourceTreeItem | undefined | void> =
    this._onDidChangeTreeData.event

  constructor() {
    ext.context.subscriptions.push(ext.authProvider.onDidChangeSessions(this.authListener))
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  private readonly authListener = async () => {
    this.refresh()
  }

  public getTreeItem(element: AffResourceTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: AffResourceTreeItem): Promise<AffResourceTreeItem[]> {
    const treeNodes: AffResourceTreeItem[] = []
    const signedIn = await isSignedIn()

    if (!signedIn) {
      switch (element?.resourceType) {
        case undefined:
          await this.addLoginItem(treeNodes)
          await this.addSignupItem(treeNodes)
          return Promise.resolve(treeNodes)
        default:
          // If a tree item is expanded and there is no active session we need to refresh the tree from the top.
          this._onDidChangeTreeData.fire()
          return Promise.resolve(treeNodes)
      }
    }

    switch (element?.resourceType) {
      case undefined:
        await this.addProjectItems(treeNodes)
        await this.addCreateProjectItem(treeNodes)
        break

      case ExplorerResourceTypes.project:
        await this.addProductItems(treeNodes, element)
        break

      case ExplorerResourceTypes.rootDID:
        await this.addDIDItems(treeNodes, element)
        break

      case ExplorerResourceTypes.rootSchemas:
        this.addSubRootSchemaItems(treeNodes, element)
        break

      case ExplorerResourceTypes.subRootSchemas:
        await this.addSchemaItems(treeNodes, element)
        break

      case ExplorerResourceTypes.rootIssuance:
        await this.addIssuanceItems(treeNodes, element)
        break

      default:
        await this.addEmptyItem(treeNodes)
        break
    }

    return Promise.resolve(treeNodes)
  }

  private async addProjectItems(treeNodes: AffResourceTreeItem[]): Promise<void> {
    const consoleAuthToken = await authHelper.getConsoleAuthToken()
    const { projects } = await iamClient.listProjects({ consoleAuthToken })

    // sort projects array in descending order on createdAt field
    const sortedProjects = projects.sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    )

    for (const project of sortedProjects) {
      const projectSummary = await requireProjectSummary(project.projectId, { consoleAuthToken })

      projectsState.setProject(projectSummary.project.projectId, projectSummary)

      this.addNewTreeItem(treeNodes, {
        type: ExplorerResourceTypes.project,
        metadata: projectSummary,
        label: project.name,
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('project'),
        projectId: projectSummary.project.projectId,
      })
    }
  }

  private async addProductItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem,
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rootDID,
      label: l10n.t('Digital Identities'),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('lock'),
      projectId: parent?.projectId,
    })

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rootIssuance,
      label: l10n.t('Issuances'),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('output'),
      projectId: parent?.projectId,
    })

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.rootSchemas,
      label: l10n.t('VC Schemas'),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('bracket'),
      projectId: parent?.projectId,
    })
  }

  private async addDIDItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem,
  ): Promise<void> {
    const projectSummary = projectsState.getProjectById(parent?.projectId)

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.did,
      metadata: projectSummary.wallet,
      label: projectSummary.wallet.did,
      icon: new ThemeIcon('lock'),
      projectId: parent?.projectId,
    })
  }

  private addSubRootSchemaItems(treeNodes: AffResourceTreeItem[], parent?: AffResourceTreeItem) {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.subRootSchemas,
      label: l10n.t('Public'),
      metadata: {
        scope: 'public',
      },
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('bracket'),
      projectId: parent?.projectId,
    })

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.subRootSchemas,
      label: l10n.t('Unlisted'),
      metadata: {
        scope: 'unlisted',
      },
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('bracket'),
      projectId: parent?.projectId,
    })
  }

  private async addSchemaItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem,
  ): Promise<void> {
    const {
      wallet: { did },
      apiKey: { apiKeyHash },
    } = projectsState.getProjectById(parent?.projectId)

    const { schemas } = await schemaManagerClient.searchSchemas(
      {
        did,
        authorDid: did,
        scope: parent?.metadata?.scope,
      },
      { apiKeyHash },
    )

    for (const schema of schemas) {
      this.addNewTreeItem(treeNodes, {
        type: ExplorerResourceTypes.schema,
        label: `${schema.type}V${schema.version}-${schema.revision}`,
        description: schema.description || '',
        metadata: schema,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
        command: {
          title: l10n.t('Open schema details'),
          command: 'schema.showSchemaDetails',
        },
      })
    }
  }

  private async addIssuanceItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem,
  ): Promise<void> {
    const {
      project: { projectId },
      apiKey: { apiKeyHash },
    } = projectsState.getProjectById(parent?.projectId)

    const { issuances } = await issuanceClient.searchIssuances({ projectId }, { apiKeyHash })

    for (const issuance of issuances) {
      this.addNewTreeItem(treeNodes, {
        type: ExplorerResourceTypes.issuance,
        metadata: issuance,
        label: formatIssuanceName(issuance),
        description: issuance.id,
        icon: new ThemeIcon('output'),
        projectId: parent?.projectId,
      })
    }
  }

  private async addEmptyItem(treeNodes: AffResourceTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.empty,
      label: l10n.t('(empty)'),
      icon: new ThemeIcon('dash'),
    })
  }

  private async addSignupItem(treeNodes: AffResourceTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.signup,
      label: l10n.t('Create an Account with Affinidi'),
      icon: new ThemeIcon('sign-in'),
      command: {
        title: l10n.t('Create an Account'),
        command: 'affinidi.signUp',
      },
    })
  }

  private async addLoginItem(treeNodes: AffResourceTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.login,
      label: l10n.t('Sign in to Affinidi'),
      icon: new ThemeIcon('sign-in'),
      command: { title: l10n.t('Sign In'), command: 'affinidi.login' },
    })
  }

  private async addCreateProjectItem(treeNodes: AffResourceTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.project,
      label: l10n.t('Create Project'),
      icon: new ThemeIcon('file-directory-create'),
      command: {
        title: l10n.t('Create Project'),
        command: 'affinidi.createProject',
      },
    })
  }

  private addNewTreeItem(
    treeNodes: AffResourceTreeItem[],
    {
      type,
      metadata,
      label,
      description,
      state = TreeItemCollapsibleState.None,
      icon = ThemeIcon.Folder,
      command,
      projectId,
    }: {
      type: ExplorerResourceTypes
      metadata?: any
      label: string
      description?: string
      state?: TreeItemCollapsibleState
      icon: ThemeIcon
      projectId?: string
      command?: Command
    },
  ) {
    treeNodes.push(
      new AffResourceTreeItem({
        resourceType: type,
        metadata,
        label,
        description,
        collapsibleState: state,
        icon,
        projectId,
        command,
      }),
    )
  }
}
