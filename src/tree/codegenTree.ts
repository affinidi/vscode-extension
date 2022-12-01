import { l10n, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { CodegenTreeItem } from './codegenTreeItem'

export enum CodegenType {
  snippets,
  snippet,
  scripts,
  script,
  apps,
  app,
}

export class CodegenTree implements TreeDataProvider<CodegenTreeItem> {
  public getTreeItem(element: CodegenTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: CodegenTreeItem): Promise<CodegenTreeItem[]> {
    switch (element?.type) {
      case undefined:
        return this.getRootItems()
      case CodegenType.scripts:
        return this.getScriptItems()
      case CodegenType.apps:
        return this.getAppItems()
      default:
        throw new Error(`Unknown codegen type: ${element?.type}`)
    }
  }

  private getRootItems() {
    return [
      new CodegenTreeItem({
        type: CodegenType.apps,
        label: l10n.t('App Generators'),
        state: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('rocket'),
      }),
      new CodegenTreeItem({
        type: CodegenType.scripts,
        label: l10n.t('Script Generators'),
        state: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('file-code'),
      }),
      new CodegenTreeItem({
        type: CodegenType.snippets,
        label: l10n.t('IntelliSense Snippets'),
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
        type: CodegenType.script,
        label: l10n.t('Send a VC Offer to an email'),
        command: 'affinidi.codegen.sendVcOfferToEmail',
      }),
      new CodegenTreeItem({
        type: CodegenType.script,
        label: l10n.t('Get Issuance Offers'),
        command: 'affinidi.codegen.getIssuanceOffers',
      }),
      new CodegenTreeItem({
        type: CodegenType.script,
        label: l10n.t('Sign a VC with Cloud Wallet'),
        command: 'affinidi.codegen.signVcWithCloudWallet',
      })
    ]
  }

  private async getAppItems() {
    return [
      new CodegenTreeItem({
        type: CodegenType.app,
        label: l10n.t('Certification & Verification'),
        command: 'affinidi.codegen.app',
      }),
    ]
  }
}
