import { TreeItemCollapsibleState, ThemeIcon, l10n } from 'vscode'
import { ext } from '../../extensionVariables'
import { ExplorerProvider, ExplorerResourceType } from '../../tree/explorerTree'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { iamState } from './iamState'

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
      case ExplorerResourceType.project:
        return this.getProductItems(element)
      case ExplorerResourceType.rootDID:
        return this.getDidItems(element)
      default:
        return undefined
    }
  }

  private async getProjectItems() {
    const projects = await iamState.listProjects()

    return projects.map(
      (project) =>
        new ExplorerTreeItem({
          resourceType: ExplorerResourceType.project,
          label: project.name,
          collapsibleState: TreeItemCollapsibleState.Collapsed,
          icon: new ThemeIcon('project'),
          projectId: project.projectId,
        }),
    )
  }

  private async getProductItems(parent?: ExplorerTreeItem) {
    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceType.rootDID,
        label: l10n.t('Digital Identities'),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('lock'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceType.rootIssuance,
        label: l10n.t('Issuances'),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('output'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceType.rootSchemas,
        label: l10n.t('VC Schemas'),
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getDidItems(parent: ExplorerTreeItem) {
    const projectSummary = await iamState.requireProjectSummary(parent.projectId!)

    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceType.did,
        label: projectSummary.wallet.did,
        icon: new ThemeIcon('lock'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getCreateProjectItem() {
    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceType.project,
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
