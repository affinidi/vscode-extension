import { TreeItem, TreeItemCollapsibleState, ThemeIcon, Command } from 'vscode'

export type AffinidiTreeItemInput = {
  label: string
  state?: TreeItemCollapsibleState
  icon?: ThemeIcon
  command?: string | Command
}

export class AffinidiTreeItem extends TreeItem {
  constructor(input: AffinidiTreeItemInput) {
    super(input.label, input.state ?? TreeItemCollapsibleState.None)

    this.iconPath = input.icon
    this.command = typeof input.command === 'string' ? {
      title: input.label,
      command: input.command,
    } : input.command
  }
}