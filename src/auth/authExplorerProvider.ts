import { l10n, ThemeIcon } from 'vscode'
import { ext } from '../extensionVariables'
import { ExplorerTree } from '../tree/explorerTree'
import { ExplorerTreeItem } from '../tree/explorerTreeItem'
import { ExplorerProvider } from '../tree/types'
import { ExplorerResourceTypes } from '../treeView/treeTypes'

export class AuthExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: ExplorerTreeItem | undefined,
    context: { tree: ExplorerTree },
  ): Promise<ExplorerTreeItem[] | undefined> {
    const isLoggedIn = await ext.authProvider.isLoggedIn()
    if (isLoggedIn) return undefined

    // if a tree item is expanded and there is no active session we need to completely refresh the tree
    if (element !== undefined) {
      context.tree.refresh()
      return []
    }

    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.signup,
        label: l10n.t('Create an Account with Affinidi'),
        icon: new ThemeIcon('sign-in'),
        command: {
          title: l10n.t('Create an Account'),
          command: 'affinidi.signUp',
        },
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.login,
        label: l10n.t('Sign in to Affinidi'),
        icon: new ThemeIcon('sign-in'),
        command: { title: l10n.t('Sign In'), command: 'affinidi.login' },
      }),
    ]
  }
}
