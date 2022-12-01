import { TreeItem, Command, TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerResourceTypes } from './explorerTree'

export class ExplorerTreeItem extends TreeItem {
  public readonly resourceType: ExplorerResourceTypes

  public readonly projectId: string | undefined

  public readonly schemaId: string | undefined

  public readonly issuanceId: string | undefined

  public readonly schemaScope: 'public' | 'unlisted' | undefined

  constructor(
    public readonly item: {
      resourceType: ExplorerResourceTypes
      label: string
      schemaId?: string
      issuanceId?: string
      schemaScope?: 'public' | 'unlisted'
      description?: string
      collapsibleState?: TreeItemCollapsibleState
      icon?: ThemeIcon
      projectId?: string
      command?: Command
    },
  ) {
    super(item.label, item.collapsibleState ?? TreeItemCollapsibleState.None)

    this.resourceType = item.resourceType
    this.tooltip = String(this.item.label)
    this.description = this.item.description
    this.schemaId = item.schemaId
    this.issuanceId = item.issuanceId
    this.schemaScope = item.schemaScope
    this.iconPath = item.icon ?? ThemeIcon.Folder
    this.contextValue = ExplorerResourceTypes[item.resourceType]
    this.projectId = item.projectId
    this.command = item.command
  }
}
