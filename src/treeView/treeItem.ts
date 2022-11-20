/* eslint-disable max-classes-per-file */
import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { ExplorerResourceTypes } from './treeTypes'

export class AffResourceTreeItem extends TreeItem {
  public resourceType: ExplorerResourceTypes

  public metadata: any

  public command: Command | undefined

  public projectId: string | undefined

  constructor(
    public readonly item: {
      resourceType: ExplorerResourceTypes
      metadata?: any
      label: string
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
    this.metadata = item.metadata
    this.iconPath = item.icon ?? ThemeIcon.Folder
    this.contextValue = ExplorerResourceTypes[item.resourceType]
    this.projectId = item.projectId
    this.command = item.command
  }
}

export class AffCodeGenTreeItem extends TreeItem {
  public codeGenType

  public command

  constructor(
    public readonly item: {
      codeGenType: string
      label: string
      collapsibleState: TreeItemCollapsibleState
      icon?: ThemeIcon
      command?: Command
    },
  ) {
    super(item.label, item.collapsibleState)
    this.codeGenType = item.codeGenType
    this.iconPath = item.icon
    this.command = item.command
  }
}
