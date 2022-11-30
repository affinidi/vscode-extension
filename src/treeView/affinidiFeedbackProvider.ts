import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { labels } from '../messages/messages'
import { AffFeedbackTreeItem } from './treeItem'

export class AffinidiFeedbackProvider implements TreeDataProvider<AffFeedbackTreeItem> {
  public getTreeItem(element: AffFeedbackTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<AffFeedbackTreeItem[]> {
    return [
      new AffFeedbackTreeItem({
        label: `${labels.giveFeedback}`,
        collapsibleState: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('github-inverted'),
        command: {
          title: `${labels.giveFeedback}`,
          command: 'affinidiFeedback.redirectToGithub',
        },
      }),
    ]
  }
}
