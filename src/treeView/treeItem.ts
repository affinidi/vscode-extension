import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

import { AffinidiVariantTypes } from "./affinidiVariant";

class AffResourceTreeItem extends TreeItem {
  public resourceType;
  public metadata;
  public parent;
  public command;

  constructor(
    public readonly item: {
      resourceType: string,
      metadata: any,
      label: string,
      description?: string,
      collapsibleState: TreeItemCollapsibleState,
      icon: ThemeIcon,
      parent?: AffResourceTreeItem,
      command?: Command
    },
  ) {
    super(item.label, item.collapsibleState);
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

export default AffResourceTreeItem;
