import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { CodegenTypes } from './codegenTree';

export class CodegenTreeItem extends TreeItem {
  public codegenType: CodegenTypes

  constructor(
    public readonly item: {
      codegenType: CodegenTypes
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