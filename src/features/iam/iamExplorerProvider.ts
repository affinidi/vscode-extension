import { TreeItemCollapsibleState, ThemeIcon, l10n } from 'vscode'
import { ext } from '../../extensionVariables'
import { projectsState } from '../../states/projectsState'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerProvider } from '../../tree/types'
import { ExplorerResourceTypes } from '../../tree/types'
import { fetchProjectsSummaryList } from './fetchProjectsSummaryList'

export class IamExplorerProvider implements ExplorerProvider {
  public async getChildren(
    element: ExplorerTreeItem | undefined,
  ): Promise<ExplorerTreeItem[] | undefined> {
    const isLoggedIn = await ext.authProvider.isLoggedIn()
    if (!isLoggedIn) return undefined

    if (element === undefined) {
      return (await Promise.all([this.getProjectItems(), this.getCreateProjectItem()])).flat()
    }

    switch (element.resourceType) {
      case ExplorerResourceTypes.project:
        return this.getProductItems(element)
      case ExplorerResourceTypes.rootDID:
        return this.getDidItems(element)
      default:
        return undefined
    }
  }

  private async getProjectItems() {
    await fetchProjectsSummaryList()
    const projects = projectsState.getProjects()

    return (projects ?? []).map(
      (project) =>
        new ExplorerTreeItem({
          resourceType: ExplorerResourceTypes.project,
          label: project.project.name,
          collapsibleState: TreeItemCollapsibleState.Collapsed,
          icon: new ThemeIcon('project'),
          projectId: project.project.projectId,
        }),
    )
  }

  private async getProductItems(parent?: ExplorerTreeItem) {
    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.rootDID,
        label: l10n.t('Digital Identities'),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('lock'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.rootIssuance,
        label: l10n.t('Issuances'),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('output'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.rootSchemas,
        label: l10n.t('VC Schemas'),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getDidItems(parent?: ExplorerTreeItem) {
    const projectSummary = projectsState.getProjectById(parent?.projectId)

    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.did,
        label: projectSummary.wallet.did,
        icon: new ThemeIcon('lock'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getCreateProjectItem() {
    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.project,
        label: l10n.t('Create Project'),
        icon: new ThemeIcon('file-directory-create'),
        command: {
          title: l10n.t('Create Project'),
          command: 'affinidi.createProject',
        },
      }),
    ]
  }
}
