import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, l10n } from 'vscode'
import { AffinidiTreeItem } from './shared/affinidiTreeItem'

export class FeedbackTree implements TreeDataProvider<AffinidiTreeItem> {
  public getTreeItem(element: AffinidiTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<AffinidiTreeItem[]> {
    return [
      new AffinidiTreeItem({
        label: l10n.t('Give Feedback'),
        state: TreeItemCollapsibleState.None,
        icon: new ThemeIcon('github-inverted'),
        command: {
          title: l10n.t('Give Feedback'),
          command: 'affinidiFeedback.redirectToGithub',
        },
      }),
    ]
  }
}
