import { l10n, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { CodegenTreeItem } from './codegenTreeItem'

export enum CodegenType {
  rootSnippets,
  snippets,
  rootScripts,
  scripts,
  rootApps,
  apps,
}

export class CodegenTree implements TreeDataProvider<CodegenTreeItem> {
  public getTreeItem(element: CodegenTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: CodegenTreeItem): Promise<CodegenTreeItem[]> {
    const treeNodes: CodegenTreeItem[] = []

    switch (element?.codegenType) {
      case undefined:
        return this.getCodeGenItems()
      case CodegenType.rootScripts:
        return this.getScriptItems()
      case CodegenType.rootApps:
        return this.getAppItems()
      default:
        throw new Error(`Unknown Codegen type: ${element?.codegenType}`)
    }
  }

  private getCodeGenItems() {
    return [
      new CodegenTreeItem({
        codegenType: CodegenType.rootApps,
        label: l10n.t('App Generators'),
        collapsibleState: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('rocket'),
      }),
      new CodegenTreeItem({
        codegenType: CodegenType.rootScripts,
        label: l10n.t('Script Generators'),
        collapsibleState: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('file-code'),
      }),
      new CodegenTreeItem({
        codegenType: CodegenType.rootSnippets,
        label: l10n.t('IntelliSense Snippets'),
        collapsibleState: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('symbol-snippet'),
        command: {
          title: l10n.t('View Available Snippets'),
          command: 'affinidi.docs.availableSnippets',
        },
      })
    ]
  }

  private getScriptItems() {
    return [
      new CodegenTreeItem({
        codegenType: CodegenType.scripts,
        label: l10n.t('Send a VC Offer to an email'),
        collapsibleState: TreeItemCollapsibleState.None,
        command: {
          title: l10n.t('Send a VC Offer to an email'),
          command: 'affinidi.codegen.sendVcOfferToEmail',
        },
      }),
      new CodegenTreeItem({
        codegenType: CodegenType.scripts,
        label: l10n.t('Get Issuance Offers'),
        collapsibleState: TreeItemCollapsibleState.None,
        command: {
          title: l10n.t('Get Issuance Offers'),
          command: 'affinidi.codegen.getIssuanceOffers',
        },
      }),
      new CodegenTreeItem({
        codegenType: CodegenType.scripts,
        label: l10n.t('Sign a VC with Cloud Wallet'),
        collapsibleState: TreeItemCollapsibleState.None,
        command: {
          title: l10n.t('Sign a VC with Cloud Wallet'),
          command: 'affinidi.codegen.signVcWithCloudWallet',
        },
      })
    ]
  }

  private async getAppItems() {
    return [
      new CodegenTreeItem({
        codegenType: CodegenType.scripts,
        label: l10n.t('Certification & Verification'),
        collapsibleState: TreeItemCollapsibleState.None,
        command: {
          title: l10n.t('Certification & Verification'),
          command: 'affinidi.codegen.app',
        },
      }),
    ]
  }
}
