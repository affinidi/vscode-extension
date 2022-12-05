import { Event, EventEmitter, l10n, ThemeIcon, TreeDataProvider, TreeItem } from 'vscode'
import { ext } from '../extensionVariables'
import { labels } from '../messages/messages'
import { BasicTreeItem } from './basicTreeItem'

export interface ExplorerProvider {
  getChildren(
    element: BasicTreeItem | undefined,
    context: { tree: ExplorerTree },
  ): Promise<BasicTreeItem[] | undefined>
}

export class ExplorerTree implements TreeDataProvider<BasicTreeItem> {
  private readonly onDidChangeTreeDataEmitter: EventEmitter<BasicTreeItem | undefined | void> =
    new EventEmitter<BasicTreeItem | undefined | void>()

  readonly onDidChangeTreeData: Event<BasicTreeItem | undefined | void> =
    this.onDidChangeTreeDataEmitter.event

  constructor(private readonly providers: ExplorerProvider[]) {
    ext.context.subscriptions.push(ext.authProvider.onDidChangeSessions(this.authListener))
  }

  refresh(data?: BasicTreeItem | undefined | void): void {
    this.onDidChangeTreeDataEmitter.fire(data)
  }

  private readonly authListener = async () => {
    this.refresh()
  }

  public getTreeItem(element: BasicTreeItem): TreeItem {
    return element
  }

  public async getChildren(element?: BasicTreeItem): Promise<BasicTreeItem[]> {
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
      new BasicTreeItem({
        label: labels.empty,
        icon: new ThemeIcon('dash'),
      }),
    ]
  }
}
