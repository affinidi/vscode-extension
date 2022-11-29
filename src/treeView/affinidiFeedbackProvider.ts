import { ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, l10n } from 'vscode'
import { AffFeedbackTreeItem } from './treeItem'

export class AffinidiFeedbackProvider implements TreeDataProvider<AffFeedbackTreeItem> {
  public getTreeItem(element: AffFeedbackTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<AffFeedbackTreeItem[]> {
    return [
      new AffFeedbackTreeItem({
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
