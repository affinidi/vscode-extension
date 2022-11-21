import {
  Command,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  l10n,
} from 'vscode'
import { AffFeedbackTreeItem } from './treeItem'

export class AffinidiFeedbackProvider implements TreeDataProvider<AffFeedbackTreeItem> {
  public getTreeItem(element: AffFeedbackTreeItem): TreeItem {
    return element
  }

  public async getChildren(): Promise<AffFeedbackTreeItem[]> {
    const treeNodes: AffFeedbackTreeItem[] = []

    this.addScriptItems(treeNodes)

    return Promise.resolve(treeNodes)
  }

  private async addScriptItems(treeNodes: AffFeedbackTreeItem[]): Promise<void> {
    this.addNewTreeItem(treeNodes, {
      label: l10n.t('Give Feedback'),
      state: TreeItemCollapsibleState.None,
      icon: new ThemeIcon('github-inverted'),
      command: {
        title: l10n.t('Give Feedback'),
        command: 'affinidiFeedback.redirectToGithub',
      },
    })
  }

  private addNewTreeItem(
    treeNodes: AffFeedbackTreeItem[],
    {
      label,
      state = TreeItemCollapsibleState.None,
      icon,
      command,
    }: {
      label: string
      state?: TreeItemCollapsibleState
      icon?: ThemeIcon
      command: Command
    },
  ) {
    treeNodes.push(
      new AffFeedbackTreeItem({
        label,
        collapsibleState: state,
        icon,
        command,
      }),
    )
  }
}
