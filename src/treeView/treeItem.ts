import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

export class AffResourceTreeItem extends TreeItem {
  public resourceType;
  public metadata;
  public parent;
  public command;

  constructor(
    public readonly item: {
      resourceType: string;
      metadata: any;
      label: string;
      description?: string;
      collapsibleState: TreeItemCollapsibleState;
      icon: ThemeIcon;
      parent?: AffResourceTreeItem;
      command?: Command;
    }
  ) {
    super(item.label, item.collapsibleState);
    this.id = JSON.stringify({ resourceType: item.resourceType, metadata: item.metadata });
    this.resourceType = item.resourceType;
    this.tooltip = `${this.item.label}`;
    this.description = this.item.description;
    this.metadata = item.metadata;
    this.iconPath = item.icon;
    this.contextValue = item.resourceType;
    this.parent = item.parent;
    this.command = item.command;
  }
}


export class AffCodeGenTreeItem extends TreeItem {
  public codeGenType;
  public command;

  constructor(
    public readonly item: {
      id: string;
      codeGenType: string;
      label: string;
      collapsibleState: TreeItemCollapsibleState;
      icon?: ThemeIcon;
      command?: Command;
    }
  ) {
    super(item.label, item.collapsibleState);
    this.id = JSON.stringify({ id: item.id });
    this.codeGenType = item.codeGenType;
    this.iconPath = item.icon;
    this.command = item.command;
  }
}
