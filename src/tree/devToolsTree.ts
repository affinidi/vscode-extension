import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { labels } from './messages'
import { DevToolsTreeItem } from './devToolsTreeItem'

export enum DevToolsType {
  snippets,
  snippet,
  scripts,
  script,
  apps,
  app,
  tools,
  tool,
}

export class DevToolsTree implements TreeDataProvider<DevToolsTreeItem> {
  public getTreeItem(element: DevToolsTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: DevToolsTreeItem): Promise<DevToolsTreeItem[]> {
    switch (element?.type) {
      case undefined:
        return this.getRootItems()
      case DevToolsType.scripts:
        return this.getScriptItems()
      case DevToolsType.apps:
        return this.getAppItems()
      case DevToolsType.tools:
        return this.getToolItems()
      default:
        throw new Error(`Unknown dev tools type: ${element?.type}`)
    }
  }

  private getRootItems() {
    return [
      new DevToolsTreeItem({
        type: DevToolsType.tools,
        label: labels.helperTools,
        state: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('tools'),
      }),
      new DevToolsTreeItem({
        type: DevToolsType.apps,
        label: labels.appGenerators,
        state: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('rocket'),
      }),
      new DevToolsTreeItem({
        type: DevToolsType.scripts,
        label: labels.scriptGenerators,
        state: TreeItemCollapsibleState.Expanded,
        icon: new ThemeIcon('file-code'),
      }),
      new DevToolsTreeItem({
        type: DevToolsType.snippets,
        label: labels.intelliSenseSnippets,
        icon: new ThemeIcon('symbol-snippet'),
        command: {
          title: labels.viewAvailableSnippets,
          command: 'affinidi.docs.availableSnippets',
        },
      }),
    ]
  }

  private getToolItems() {
    return [
      new DevToolsTreeItem({
        type: DevToolsType.tool,
        label: labels.schemaBuilder,
        command: 'affinidi.openSchemaBuilder',
      }),
      new DevToolsTreeItem({
        type: DevToolsType.tool,
        label: labels.initiateIssuanceCsvFlow,
        command: 'affinidi.initiateIssuanceCsvFlow',
      }),
      new DevToolsTreeItem({
        type: DevToolsType.tool,
        label: labels.verifyVC,
        command: 'affinidi.verifyVC',
      }),
    ]
  }

  private getScriptItems() {
    return [
      new DevToolsTreeItem({
        type: DevToolsType.script,
        label: labels.sendVCOfferToEmail,
        command: 'affinidi.codegen.sendVcOfferToEmail',
      }),
      new DevToolsTreeItem({
        type: DevToolsType.script,
        label: labels.getIssuanceOffers,
        command: 'affinidi.codegen.getIssuanceOffers',
      }),
      new DevToolsTreeItem({
        type: DevToolsType.script,
        label: labels.signCloudWalletVc,
        command: 'affinidi.codegen.signVcWithCloudWallet',
      }),
    ]
  }

  private async getAppItems() {
    return [
      new DevToolsTreeItem({
        type: DevToolsType.app,
        label: labels.certificationAndVerification,
        command: 'affinidi.codegen.app',
      }),
      new DevToolsTreeItem({
        type: DevToolsType.app,
        label: labels.portableReputation,
        command: 'affinidi.codegen.app',
      }),
    ]
  }
}
