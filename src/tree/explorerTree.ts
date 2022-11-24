import { Event, EventEmitter, l10n, ThemeIcon, TreeDataProvider, TreeItem } from 'vscode'
import { ExplorerTreeItem } from './explorerTreeItem'
import { ext } from '../extensionVariables'
import { ExplorerResourceTypes } from '../treeView/treeTypes'
import { ExplorerProvider } from './types'

export class ExplorerTree implements TreeDataProvider<ExplorerTreeItem> {
  private readonly onDidChangeTreeDataEmitter: EventEmitter<ExplorerTreeItem | undefined | void> =
    new EventEmitter<ExplorerTreeItem | undefined | void>()

  readonly onDidChangeTreeData: Event<ExplorerTreeItem | undefined | void> =
    this.onDidChangeTreeDataEmitter.event

  constructor(private readonly providers: ExplorerProvider[]) {
    ext.context.subscriptions.push(ext.authProvider.onDidChangeSessions(this.authListener))
  }

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire()
  }

  private readonly authListener = async () => {
    this.refresh()
  }

  public getTreeItem(element: ExplorerTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: ExplorerTreeItem): Promise<ExplorerTreeItem[]> {
    for (const provider of this.providers) {
      // eslint-disable-next-line no-await-in-loop
      const items = await provider.getChildren(element, { tree: this })
      if (items !== undefined) {
        return items
      }
    }

    return this.getEmptyItems()
  }

  private async getEmptyItems() {
    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.empty,
        label: l10n.t('(empty)'),
        icon: new ThemeIcon('dash'),
      }),
    ]
  }
}