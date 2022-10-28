import { TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import { AffSnippetTreeItem } from "./treeItem";

export class AffinidiSnippetProvider
  implements TreeDataProvider<AffSnippetTreeItem>
{
  constructor() {}

  public getTreeItem(element: AffSnippetTreeItem): TreeItem {
    return element;
  }

  public async getChildren(
    element?: AffSnippetTreeItem
  ): Promise<AffSnippetTreeItem[]> {
    const treeNodes: AffSnippetTreeItem[] = [];

    this._addProductItems(treeNodes);

    return Promise.resolve(treeNodes);
  }

  private async _addProductItems(
    treeNodes: AffSnippetTreeItem[]
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      label: "Send VC Offer to Email",
      state: TreeItemCollapsibleState.None,
      command: {
        title: "Send VC Offer to Email",
        command: "affinidi.codegen.sendVcOfferToEmail",
      },
    });
  }

  private addNewTreeItem(
    treeNodes: AffSnippetTreeItem[],
    {
      label,
      state = TreeItemCollapsibleState.None,
      command,
    }: {
      label: string;
      state?: TreeItemCollapsibleState;
      command: any;
    }
  ) {
    treeNodes.push(
      new AffSnippetTreeItem({
        label,
        collapsibleState: state,
        command,
      })
    );
  }
}
