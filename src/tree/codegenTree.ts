import { l10n, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { labels } from '../messages/messages'
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
        label: labels.appGenerators,
        state: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('rocket'),
      }),
      new CodegenTreeItem({
        type: CodegenType.scripts,
        label: labels.scriptGenerators,
        state: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('file-code'),
      }),
      new CodegenTreeItem({
        type: CodegenType.snippets,
        label: labels.intelliSenseSnippets,
        icon: new ThemeIcon('symbol-snippet'),
        command: {
          title: labels.viewAvailableSnippets,
          command: 'affinidi.docs.availableSnippets',
        },
      })
    ]
  }

  private getScriptItems() {
    return [
      new CodegenTreeItem({
        type: CodegenType.script,
        label: labels.sendVCOfferToEmail,
        command: 'affinidi.codegen.sendVcOfferToEmail',
      }),
      new CodegenTreeItem({
        type: CodegenType.script,
        label: labels.getIssuanceOffers,
        command: 'affinidi.codegen.getIssuanceOffers',
      }),
      new CodegenTreeItem({
        type: CodegenType.script,
        label: labels.signCloudWalletVc,
        command: 'affinidi.codegen.signVcWithCloudWallet',
      })
    ]
  }

  private async getAppItems() {
    return [
      new CodegenTreeItem({
        type: CodegenType.app,
        label: labels.certificationAndVerification,
        command: 'affinidi.codegen.app',
      }),
    ]
  }
}
