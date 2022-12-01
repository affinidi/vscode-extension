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

    switch (element.type) {
      case ExplorerResourceType.project:
        return this.getProductItems(element)
      case ExplorerResourceType.dids:
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
          type: ExplorerResourceType.project,
          label: project.name,
          state: TreeItemCollapsibleState.Collapsed,
          icon: new ThemeIcon('project'),
          projectId: project.projectId,
        }),
    )
  }

  private async getProductItems(parent?: ExplorerTreeItem) {
    return [
      new ExplorerTreeItem({
        type: ExplorerResourceType.dids,
        label: l10n.t('Digital Identities'),
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('lock'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        type: ExplorerResourceType.issuances,
        label: l10n.t('Issuances'),
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('output'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        type: ExplorerResourceType.schemas,
        label: l10n.t('VC Schemas'),
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getDidItems(parent: ExplorerTreeItem) {
    const projectSummary = await iamState.requireProjectSummary(parent.projectId!)

    return [
      new ExplorerTreeItem({
        type: ExplorerResourceType.did,
        label: projectSummary.wallet.did,
        icon: new ThemeIcon('lock'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getCreateProjectItem() {
    return [
      new ExplorerTreeItem({
        type: ExplorerResourceType.project,
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
