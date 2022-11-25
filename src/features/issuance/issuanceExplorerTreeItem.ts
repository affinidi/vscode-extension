import { TreeItemCollapsibleState, ThemeIcon, Command } from 'vscode'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'

export class IssuanceExplorerTreeItem extends ExplorerTreeItem {
  public readonly issuanceId: string | undefined

  constructor(
    public readonly item: {
      resourceType: ExplorerResourceTypes
      label: string
      issuanceId?: string
      description?: string
      collapsibleState?: TreeItemCollapsibleState
      icon?: ThemeIcon
      projectId?: string
      command?: Command
    },
  ) {
    super(item)

    this.issuanceId = item.issuanceId
  }
}
