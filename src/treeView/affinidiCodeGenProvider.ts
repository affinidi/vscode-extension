import {
  Command,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  l10n,
} from 'vscode'
import { CodeGenTypes } from './treeTypes'
import { AffCodeGenTreeItem } from './treeItem'

export class AffinidiCodeGenProvider implements TreeDataProvider<AffCodeGenTreeItem> {
  public getTreeItem(element: AffCodeGenTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: AffCodeGenTreeItem): Promise<AffCodeGenTreeItem[]> {
    const treeNodes: AffCodeGenTreeItem[] = []

    switch (element?.codeGenType) {
      case undefined:
        this.addCodeGenItems(treeNodes)
        break

      case CodeGenTypes[CodeGenTypes.rootScripts]:
        await this.addScriptItems(treeNodes)
        break

      case CodeGenTypes[CodeGenTypes.rootApps]:
        await this.addAppItems(treeNodes)
        break

      default:
        throw new Error(`unknown codeGenType: ${element?.codeGenType}`)
    }

    return Promise.resolve(treeNodes)
  }

  private async addCodeGenItems(treeNodes: AffCodeGenTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootApps,
      label: l10n.t('App Generators'),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('rocket'),
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootScripts,
      label: l10n.t('Script Generators'),
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('file-code'),
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootSnippets,
      label: l10n.t('IntelliSense Snippets'),
      state: TreeItemCollapsibleState.None,
      icon: new ThemeIcon('symbol-snippet'),
      command: {
        title: l10n.t('View Available Snippets'),
        command: 'affinidi.docs.availableSnippets',
      },
    })
  }

  private async addScriptItems(treeNodes: AffCodeGenTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: l10n.t('Send a VC Offer to an email'),
      state: TreeItemCollapsibleState.None,
      command: {
        title: l10n.t('Send a VC Offer to an email'),
        command: 'affinidi.codegen.sendVcOfferToEmail',
      },
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: l10n.t('Get Issuance Offers'),
      state: TreeItemCollapsibleState.None,
      command: {
        title: l10n.t('Get Issuance Offers'),
        command: 'affinidi.codegen.getIssuanceOffers',
      },
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: l10n.t('Sign a VC with Cloud Wallet'),
      state: TreeItemCollapsibleState.None,
      command: {
        title: l10n.t('Sign a VC with Cloud Wallet'),
        command: 'affinidi.codegen.signVcWithCloudWallet',
      },
    })
  }

  private async addAppItems(treeNodes: AffCodeGenTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: l10n.t('Certification & Verification'),
      state: TreeItemCollapsibleState.None,
      command: {
        title: l10n.t('Certification & Verification'),
        command: 'affinidi.codegen.app',
      },
    })
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
      type: CodeGenTypes
      label: string
      state?: TreeItemCollapsibleState
      icon?: ThemeIcon
      command?: Command
    },
  ) {
    treeNodes.push(
      new AffCodeGenTreeItem({
        codeGenType: CodeGenTypes[type],
        label,
        collapsibleState: state,
        icon,
        command,
      }),
    )
  }
}
