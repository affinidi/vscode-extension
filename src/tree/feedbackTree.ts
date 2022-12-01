import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, l10n } from 'vscode'
import { FeedbackTreeItem } from './feedbackTreeItem'

export class FeedbackTree implements TreeDataProvider<FeedbackTreeItem> {
  public getTreeItem(element: FeedbackTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<FeedbackTreeItem[]> {
    return [
      new FeedbackTreeItem({
        label: l10n.t('Give Feedback'),
        collapsibleState: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('github-inverted'),
        command: {
          title: l10n.t('Give Feedback'),
          command: 'affinidiFeedback.redirectToGithub',
        },
      }),
    ]
  }
}
