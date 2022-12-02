import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, l10n } from 'vscode'
import { labels } from '../messages/messages'
import { BasicTreeItem } from './basicTreeItem'

export class FeedbackTree implements TreeDataProvider<BasicTreeItem> {
  public getTreeItem(element: BasicTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<BasicTreeItem[]> {
    return [
      new BasicTreeItem({
        label: labels.giveFeedback,
        state: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('github-inverted'),
        command: {
          title: labels.giveFeedback,
          command: 'affinidiFeedback.redirectToGithub',
        },
      }),
    ]
  }
}
