import { Event, EventEmitter, l10n, ThemeIcon, TreeDataProvider, TreeItem } from 'vscode'
import { credentialsVaultService } from '../auth/authentication-provider/credentialsVault'
import { affinidiActiveProjectChangeProvider } from '../auth/handleActiveProjectChange'
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
    this.refresh()
    const activeProject = credentialsVaultService.getActiveProjectSummary()
    console.log('activeProject', activeProject)
    if (activeProject) {
      setActiveProject(activeProject.project.projectId)
      return
    }
    const projects = await iamState.listProjects()
    setActiveProject(projects[0].projectId)
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
