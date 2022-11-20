/* eslint-disable no-underscore-dangle */
import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, l10n } from 'vscode'
import { ExplorerResourceTypes } from './treeTypes'
import { AffResourceTreeItem } from './treeItem'
import { ext } from '../extensionVariables'
import { TreeProvider } from '../shared/treeProvider'

export class AffinidiExplorerProvider implements TreeDataProvider<AffResourceTreeItem> {
  private readonly _onDidChangeTreeData: EventEmitter<AffResourceTreeItem | undefined | void> =
    new EventEmitter<AffResourceTreeItem | undefined | void>()

  readonly onDidChangeTreeData: Event<AffResourceTreeItem | undefined | void> =
    this._onDidChangeTreeData.event

  constructor(private readonly providers: TreeProvider<AffResourceTreeItem>[]) {
    ext.context.subscriptions.push(ext.authProvider.onDidChangeSessions(this.authListener))
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  private readonly authListener = async () => {
    this.refresh()
  }

  public getTreeItem(element: AffResourceTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: AffResourceTreeItem): Promise<AffResourceTreeItem[]> {
    for (const provider of this.providers) {
      // eslint-disable-next-line no-await-in-loop
      const items = await provider.getChildren(element, { treeDataProvider: this })
      if (items !== undefined) {
        return items
      }
    }

    return this.getEmptyItems()
  }

  private async getEmptyItems() {
    return [
      new AffResourceTreeItem({
        resourceType: ExplorerResourceTypes.empty,
        label: l10n.t('(empty)'),
        icon: new ThemeIcon('dash'),
      }),
    ]
  }
}
