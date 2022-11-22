/* eslint-disable @typescript-eslint/no-explicit-any */

import { TreeItem, Command, TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerResourceTypes } from '../treeView/treeTypes'

export class ExplorerTreeItem extends TreeItem {
  public readonly resourceType: ExplorerResourceTypes

  public readonly metadata: any

  public readonly command: Command | undefined

  public readonly projectId: string | undefined

  constructor(
    public readonly item: {
      resourceType: ExplorerResourceTypes
      label: string
      metadata?: any
      description?: string
      collapsibleState?: TreeItemCollapsibleState
      icon?: ThemeIcon
      projectId?: string
      command?: Command
    },
  ) {
    super(item.label, item.collapsibleState ?? TreeItemCollapsibleState.None)

    this.resourceType = item.resourceType
    this.tooltip = this.item.label.toString()
    this.description = this.item.description
    this.metadata = item.metadata
    this.iconPath = item.icon ?? ThemeIcon.Folder
    this.contextValue = ExplorerResourceTypes[item.resourceType]
    this.projectId = item.projectId
    this.command = item.command
  }
}
