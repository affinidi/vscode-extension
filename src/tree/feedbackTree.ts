import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode'
import { labels } from '../messages/messages'
import { BasicTreeItem } from './basicTreeItem'

export class FeedbackTree implements TreeDataProvider<BasicTreeItem> {
  public getTreeItem(element: BasicTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<BasicTreeItem[]> {
    return [
      new BasicTreeItem({
        label: labels.openWalkthrough,
        state: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('extensions'),
        command: {
          title: labels.openWalkthrough,
          command: 'affinidiFeedback.openWalkthrough',
        },
      }),
      new BasicTreeItem({
        label: labels.openAPIDocs,
        state: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('globe'),
        command: {
          title: labels.openAPIDocs,
          command: 'affinidiFeedback.openAPIDocs',
        },
      }),
      new BasicTreeItem({
        label: labels.reviewIssues,
        state: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('issues'),
        command: {
          title: labels.reviewIssues,
          command: 'affinidiFeedback.reviewIssues',
        },
      }),
      new BasicTreeItem({
        label: labels.reportIssue,
        state: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('report'),
        command: {
          title: labels.reportIssue,
          command: 'affinidiFeedback.reportIssue',
        },
      }),
      new BasicTreeItem({
        label: labels.openDiscord,
        state: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('comment'),
        command: {
          title: labels.openDiscord,
          command: 'affinidiFeedback.openDiscord',
        },
      }),
    ]
  }
}
