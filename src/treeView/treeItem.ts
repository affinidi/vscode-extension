import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

class AffResourceTreeItem extends TreeItem {
  constructor(
    public readonly resourceType: string,
    public readonly metadata: any,
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly icon: ThemeIcon,
    public readonly parent?: AffResourceTreeItem,
    public readonly command?: Command,
    public readonly id?: string
  ) {
    super(label, collapsibleState);
    this.resourceType = resourceType;
    this.tooltip = `${this.label}`;
    this.description = description;
    this.metadata = metadata;
    this.iconPath = icon;
    this.contextValue = resourceType;
    this.parent = parent;
    this.command = command;
    this.id = id;
  }
}

export default AffResourceTreeItem;
