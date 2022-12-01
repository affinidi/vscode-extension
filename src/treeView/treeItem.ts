import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode'

export class AffFeedbackTreeItem extends TreeItem {
  public command: Command

  constructor(
    public readonly item: {
      label: string
      collapsibleState: TreeItemCollapsibleState
      icon?: ThemeIcon
      command: Command
    },
  ) {
    super(item.label, item.collapsibleState)
    this.iconPath = item.icon
    this.command = item.command
  }
}
