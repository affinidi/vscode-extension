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
      label: "Send a VC Offer to an email",
      state: TreeItemCollapsibleState.None,
      command: {
        title: "Send a VC Offer to an email",
        command: "affinidi.codegen.sendVcOfferToEmail",
      },
    });

    this.addNewTreeItem(treeNodes, {
      label: "Get Issuance offers",
      state: TreeItemCollapsibleState.None,
      command: {
        title: "Get Issuance offers",
        command: "affinidi.codegen.getIssuanceOffers",
      },
    });

    this.addNewTreeItem(treeNodes, {
      label: "Sign a VC with Cloud Wallet",
      state: TreeItemCollapsibleState.None,
      command: {
        title: "Sign a VC with Cloud Wallet",
        command: "affinidi.codegen.signVcWithCloudWallet",
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
