import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

export class AffResourceTreeItem extends TreeItem {
  public resourceType;
  public metadata;
  public command;
  public projectId;

  constructor(
    public readonly item: {
      resourceType: string;
      metadata: any;
      label: string;
      description?: string;
      collapsibleState: TreeItemCollapsibleState;
      icon: ThemeIcon;
      projectId?: string;
      command?: Command;
    }
  ) {
    super(item.label, item.collapsibleState);
    this.resourceType = item.resourceType;
    this.tooltip = `${this.item.label}`;
    this.description = this.item.description;
    this.metadata = item.metadata;
    this.iconPath = item.icon;
    this.contextValue = item.resourceType;
    this.projectId = item.projectId;
    this.command = item.command;
  }
}

export class AffCodeGenTreeItem extends TreeItem {
  public codeGenType;
  public command;

  constructor(
    public readonly item: {
      codeGenType: string;
      label: string;
      collapsibleState: TreeItemCollapsibleState;
      icon?: ThemeIcon;
      command?: Command;
    }
  ) {
    super(item.label, item.collapsibleState);
    this.codeGenType = item.codeGenType;
    this.iconPath = item.icon;
    this.command = item.command;
  }
}
