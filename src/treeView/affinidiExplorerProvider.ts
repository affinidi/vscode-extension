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
import { getProjectIssuances, IssuanceList } from '../services/issuancesService'
import { iamService, ProjectList, ProjectSummary } from '../services/iamService'
import { getMySchemas, SchemaSearchScope } from '../services/schemaManagerService'
import { ExplorerResourceTypes } from './treeTypes'
import { AffResourceTreeItem } from './treeItem'
import { ext } from '../extensionVariables'
import { formatIssuanceName } from '../shared/formatIssuanceName'

const isSignedIn = async () => {
  const sessions = await ext.authProvider.getSessions()
  return !!sessions.length
}

const { getProjects, getProjectSummary } = iamService

export class AffinidiExplorerProvider implements TreeDataProvider<AffResourceTreeItem> {
  private readonly _onDidChangeTreeData: EventEmitter<AffResourceTreeItem | undefined | void> =
    new EventEmitter<AffResourceTreeItem | undefined | void>()

  readonly onDidChangeTreeData: Event<AffResourceTreeItem | undefined | void> =
    this._onDidChangeTreeData.event

  private projects: Record<string, ProjectSummary> = {}

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
      await this.addLoginItem(treeNodes)
      await this.addSignupItem(treeNodes)

      return Promise.resolve(treeNodes)
    }

    switch (element?.resourceType) {
      case undefined:
        await this.addProjectItems(treeNodes)
        await this.addCreateProjectItem(treeNodes)
        break

      case ExplorerResourceTypes[ExplorerResourceTypes.project]:
        await this.addProductItems(treeNodes, element)
        break

      case ExplorerResourceTypes[ExplorerResourceTypes.rootDID]:
        await this.addDIDItems(treeNodes, element)
        break

      case ExplorerResourceTypes[ExplorerResourceTypes.rootSchemas]:
        this.addSubRootSchemaItems(treeNodes, element)
        break

      case ExplorerResourceTypes[ExplorerResourceTypes.subRootSchemas]:
        await this.addSchemaItems(treeNodes, element)
        break

      case ExplorerResourceTypes[ExplorerResourceTypes.rootIssuance]:
        await this.addIssuanceItems(treeNodes, element)
        break

      default:
        await this.addEmptyItem(treeNodes)
        break
    }

    return Promise.resolve(treeNodes)
  }

  private getProject(projectId: string = '') {
    return this.projects[projectId]
  }

  private async addProjectItems(treeNodes: AffResourceTreeItem[]): Promise<void> {
    const projectListResponse: ProjectList = await getProjects()

    // sort projects array in descending order on createdAt field
    const sortedProjects = projectListResponse.projects.sort(
      (projectA, projectB) => Date.parse(projectB.createdAt) - Date.parse(projectA.createdAt),
    )

    for (const project of sortedProjects) {
      const projectSummary = await getProjectSummary(project.projectId)

      this.projects[projectSummary.project.projectId] = projectSummary

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
    const projectInfo = this.getProject(parent?.projectId)

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.did,
      metadata: projectInfo.wallet,
      label: projectInfo.wallet.did,
      icon: new ThemeIcon('lock'),
      projectId: parent?.projectId,
    })
  }

  private addSubRootSchemaItems(treeNodes: AffResourceTreeItem[], parent?: AffResourceTreeItem) {
    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.subRootSchemas,
      label: l10n.t('Public'),
      metadata: {
        scope: 'public' as SchemaSearchScope,
      },
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('bracket'),
      projectId: parent?.projectId,
    })

    this.addNewTreeItem(treeNodes, {
      type: ExplorerResourceTypes.subRootSchemas,
      label: l10n.t('Unlisted'),
      metadata: {
        scope: 'unlisted' as SchemaSearchScope,
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
    const projectInfo = this.getProject(parent?.projectId)

    const res = await getMySchemas({
      did: projectInfo.wallet.did,
      scope: parent?.metadata?.scope,
      apiKeyHash: projectInfo.apiKey.apiKeyHash,
    })

    res.schemas.map((schema) => {
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
    })
  }

  private async addIssuanceItems(
    treeNodes: AffResourceTreeItem[],
    parent?: AffResourceTreeItem,
  ): Promise<void> {
    const projectInfo = this.getProject(parent?.projectId)

    const issuanceListResponse: IssuanceList = await getProjectIssuances({
      apiKeyHash: projectInfo.apiKey.apiKeyHash,
      projectId: projectInfo.project.projectId,
    })

    issuanceListResponse.issuances.map((issuance) => {
      this.addNewTreeItem(treeNodes, {
        type: ExplorerResourceTypes.issuance,
        metadata: issuance,
        label: formatIssuanceName(issuance),
        description: issuance.id,
        icon: new ThemeIcon('output'),
        projectId: parent?.projectId,
      })
    })
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
        resourceType: ExplorerResourceTypes[type],
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
