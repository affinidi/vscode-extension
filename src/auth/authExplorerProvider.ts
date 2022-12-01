import { l10n, ThemeIcon } from 'vscode'
import { ext } from '../extensionVariables'
import { BasicTreeItem } from '../tree/basicTreeItem'
import { ExplorerProvider, ExplorerTree } from '../tree/explorerTree'

export class AuthExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: BasicTreeItem | undefined,
    context: { tree: ExplorerTree },
  ): Promise<BasicTreeItem[] | undefined> {
    const isLoggedIn = await ext.authProvider.isLoggedIn()
    if (isLoggedIn) return undefined

    // if a tree item is expanded and there is no active session we need to completely refresh the tree
    if (element !== undefined) {
      context.tree.refresh()
      return []
    }

    return [
      new BasicTreeItem({
        label: l10n.t('Create an Account with Affinidi'),
        icon: new ThemeIcon('sign-in'),
        command: {
          title: l10n.t('Create an Account'),
          command: 'affinidi.signUp',
        },
      }),
      new BasicTreeItem({
        label: l10n.t('Sign in to Affinidi'),
        icon: new ThemeIcon('sign-in'),
        command: { title: l10n.t('Sign In'), command: 'affinidi.login' },
      }),
    ]
  }
}
