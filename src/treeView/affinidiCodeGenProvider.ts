import { Command, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { CodeGenTypes } from './treeTypes'
import { AffCodeGenTreeItem } from './treeItem'
import { errorMessage, labels } from '../messages/messages'

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
        throw new Error(`${errorMessage.unknownCodeGen} ${element?.codeGenType}`)
    }

    return Promise.resolve(treeNodes)
  }

  private async addCodeGenItems(treeNodes: AffCodeGenTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootApps,
      label: labels.appGenerators,
      state: TreeItemCollapsibleState.Expanded,
      icon: new ThemeIcon('rocket'),
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootScripts,
      label: labels.scriptGenerators,
      state: TreeItemCollapsibleState.Expanded,
      icon: new ThemeIcon('file-code'),
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.rootSnippets,
      label: labels.intelliSenseSnippets,
      state: TreeItemCollapsibleState.None,
      icon: new ThemeIcon('symbol-snippet'),
      command: {
        title: labels.viewAvailableSnippets,
        command: 'affinidi.docs.availableSnippets',
      },
    })
  }

  private async addScriptItems(treeNodes: AffCodeGenTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: labels.sendVCOfferToEmail,
      state: TreeItemCollapsibleState.None,
      command: {
        title: labels.sendVCOfferToEmail,
        command: 'affinidi.codegen.sendVcOfferToEmail',
      },
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: labels.getIssuanceOffers,
      state: TreeItemCollapsibleState.None,
      command: {
        title: labels.getIssuanceOffers,
        command: 'affinidi.codegen.getIssuanceOffers',
      },
    })

    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: labels.signCloudWalletVc,
      state: TreeItemCollapsibleState.None,
      command: {
        title: labels.signCloudWalletVc,
        command: 'affinidi.codegen.signVcWithCloudWallet',
      },
    })
  }

  private async addAppItems(treeNodes: AffCodeGenTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      type: CodeGenTypes.scripts,
      label: labels.certificationAndVerification,
      state: TreeItemCollapsibleState.None,
      command: {
        title: labels.certificationAndVerification,
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
