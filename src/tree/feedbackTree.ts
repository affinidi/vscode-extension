import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, l10n } from 'vscode'
import { BasicTreeItem } from './basicTreeItem'

export class FeedbackTree implements TreeDataProvider<BasicTreeItem> {
  public getTreeItem(element: BasicTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<BasicTreeItem[]> {
    return [
      new BasicTreeItem({
        label: l10n.t('Give Feedback'),
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
