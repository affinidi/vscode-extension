import * as vscode from "vscode";
import { ThemeIcon } from "vscode";

class AffResourceTreeItem extends vscode.TreeItem {
  constructor(
    public readonly resourceType: string,
    public readonly metadata: any,
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly icon: ThemeIcon,
    public readonly parent?: AffResourceTreeItem
  ) {
    super(label, collapsibleState);
    this.resourceType = resourceType;
    this.tooltip = `${this.label}`;
    this.description = this.description;
    this.metadata = metadata;
    this.iconPath = icon;
    this.contextValue = resourceType;
    this.parent = parent;
  }
}

export default AffResourceTreeItem;
