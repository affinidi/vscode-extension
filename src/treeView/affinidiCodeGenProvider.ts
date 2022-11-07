import {
  Command,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import { CodeGenTypes } from "./treeTypes";
import { AffCodeGenTreeItem } from "./treeItem";

export class AffinidiCodeGenProvider
  implements TreeDataProvider<AffCodeGenTreeItem>
{
  constructor() {}

  public getTreeItem(element: AffCodeGenTreeItem): TreeItem {
    return element;
  }

  public async getChildren(
    element?: AffCodeGenTreeItem
  ): Promise<AffCodeGenTreeItem[]> {
    const treeNodes: AffCodeGenTreeItem[] = [];

    switch (element?.codeGenType) {
      case undefined:
        this._addCodeGenItems(treeNodes);
        break;

      case CodeGenTypes[CodeGenTypes.rootScripts]:
        await this._addScriptItems(treeNodes);
        break;

      case CodeGenTypes[CodeGenTypes.rootApps]:
        await this._addAppItems(treeNodes);
        break;
    }

    return Promise.resolve(treeNodes);
  }

  private async _addCodeGenItems(
    treeNodes: AffCodeGenTreeItem[]
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootSnippets,
      label: "IntelliSense Snippets",
      state: TreeItemCollapsibleState.None,
      icon: new ThemeIcon("symbol-snippet"),
      command: {
        title: "View Available Snippets",
        command: "affinidi.docs.availableSnippets",
      },
    });

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootScripts,
      label: "Script Generators",
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("file-code"),
    });

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootApps,
      label: "App Generators",
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon("rocket"),
    });
  }

  private async _addScriptItems(
    treeNodes: AffCodeGenTreeItem[]
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: "Send a VC Offer to an email",
      state: TreeItemCollapsibleState.None,
      command: {
        title: "Send a VC Offer to an email",
        command: "affinidi.codegen.sendVcOfferToEmail",
      },
    });

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: "Get Issuance Offers",
      state: TreeItemCollapsibleState.None,
      command: {
        title: "Get Issuance Offers",
        command: "affinidi.codegen.getIssuanceOffers",
      },
    });

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: "Sign a VC with Cloud Wallet",
      state: TreeItemCollapsibleState.None,
      command: {
        title: "Sign a VC with Cloud Wallet",
        command: "affinidi.codegen.signVcWithCloudWallet",
      },
    });
  }

  private async _addAppItems(
    treeNodes: AffCodeGenTreeItem[]
  ): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: "Certification & Verification",
      state: TreeItemCollapsibleState.None,
    });
  }

  private addNewTreeItem(
    treeNodes: AffCodeGenTreeItem[],
    {
      type,
      label,
      state = TreeItemCollapsibleState.None,
      icon,
      command,
    }: {
      type: CodeGenTypes;
      label: string;
      state?: TreeItemCollapsibleState;
      icon?: ThemeIcon;
      command?: Command;
    }
  ) {
    treeNodes.push(
      new AffCodeGenTreeItem({
        codeGenType: CodeGenTypes[type],
        label,
        collapsibleState: state,
        icon,
        command,
      })
    );
  }
}
