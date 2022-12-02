import { TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ext } from '../../extensionVariables'
import { labels } from '../../messages/messages'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerProvider } from '../../tree/types'
import { ExplorerResourceTypes } from '../../tree/types'
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
      case ExplorerResourceTypes.project:
        return this.getProductItems(element)
      case ExplorerResourceTypes.rootDID:
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
          resourceType: ExplorerResourceTypes.project,
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
        resourceType: ExplorerResourceTypes.rootDID,
        label: labels.digitalIdenties,
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('lock'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.rootIssuance,
        label: labels.issuanes,
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('output'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.rootSchemas,
        label: labels.vcSchemas,
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
        label: labels.createProject,
        icon: new ThemeIcon('file-directory-create'),
        command: {
          title: labels.createProject,
          command: 'affinidi.createProject',
        },
      }),
    ]
  }
}
