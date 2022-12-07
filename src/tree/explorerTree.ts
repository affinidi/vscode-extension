import { Event, EventEmitter, l10n, ThemeIcon, TreeDataProvider, TreeItem } from 'vscode'
import { configVaultService } from '../auth/authentication-provider/configVault'
import { credentialsVaultService } from '../auth/authentication-provider/credentialsVault'
import { affinidiActiveProjectChangeProvider } from '../features/iam/handleActiveProjectChange'
import { ext } from '../extensionVariables'
import { iamState } from '../features/iam/iamState'
import { setActiveProject } from '../features/iam/setActiveProject'
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
    ext.context.subscriptions.push(
      affinidiActiveProjectChangeProvider.onDidChangeActiveProject(this.activeProjectListener),
    )
  }

  refresh(data?: BasicTreeItem | undefined | void): void {
    this.onDidChangeTreeDataEmitter.fire(data)
  }

  private readonly authListener = async () => {
    this.refresh()
  }

  private readonly activeProjectListener = async () => {
    const currentUserId = configVaultService.getCurrentUserID()
    const activeProjectId = configVaultService.getActiveProjectId(currentUserId)
    const projects = await iamState.listProjects()

    if (projects.length > 0) {
      setActiveProject(activeProjectId ?? projects[0].projectId)
    }
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
