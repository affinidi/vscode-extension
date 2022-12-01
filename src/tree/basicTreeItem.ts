import { TreeItem, TreeItemCollapsibleState, ThemeIcon, Command } from 'vscode'

export type BasicTreeItemInput = {
  label: string
  description?: string
  state?: TreeItemCollapsibleState
  icon?: ThemeIcon
  command?: string | Command
  contextValue?: string
}

export class BasicTreeItem extends TreeItem {
  constructor(input: BasicTreeItemInput) {
    super(input.label, input.state ?? TreeItemCollapsibleState.None)

    this.iconPath = input.icon
    this.description = input.description
    this.contextValue = input.contextValue
    this.tooltip = input.label
    this.command = typeof input.command === 'string' ? {
      title: input.label,
      command: input.command,
    } : input.command
  }
}