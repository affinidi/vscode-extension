import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { CodegenType } from './codegenTree';

export class CodegenTreeItem extends TreeItem {
  public codegenType: CodegenType

  constructor(
    public readonly item: {
      codegenType: CodegenType
      label: string
      collapsibleState: TreeItemCollapsibleState
      icon?: ThemeIcon
      command?: Command
    },
  ) {
    super(item.label, item.collapsibleState)

    this.codegenType = item.codegenType
    this.iconPath = item.icon
    this.command = item.command
  }
}