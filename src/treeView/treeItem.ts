import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode'

export class AffCodeGenTreeItem extends TreeItem {
  public codeGenType

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
