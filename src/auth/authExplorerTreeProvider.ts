import { l10n, ThemeIcon } from 'vscode'
import { ext } from '../extensionVariables'
import { TreeProvider } from '../shared/treeProvider'
import { AffinidiExplorerProvider } from '../treeView/affinidiExplorerProvider'
import { AffResourceTreeItem } from '../treeView/treeItem'
import { ExplorerResourceTypes } from '../treeView/treeTypes'

export class AuthExplorerTreeProvider implements TreeProvider<AffResourceTreeItem> {
  async getChildren(
    element: AffResourceTreeItem | undefined,
    context: { treeDataProvider: AffinidiExplorerProvider },
  ): Promise<AffResourceTreeItem[] | undefined> {
    const isLoggedIn = await ext.authProvider.isLoggedIn()
    if (isLoggedIn) return undefined

    if (element === undefined) {
      return [
        new AffResourceTreeItem({
          resourceType: ExplorerResourceTypes.signup,
          label: l10n.t('Create an Account with Affinidi'),
          icon: new ThemeIcon('sign-in'),
          command: {
            title: l10n.t('Create an Account'),
            command: 'affinidi.signUp',
          },
        }),
        new AffResourceTreeItem({
          resourceType: ExplorerResourceTypes.login,
          label: l10n.t('Sign in to Affinidi'),
          icon: new ThemeIcon('sign-in'),
          command: { title: l10n.t('Sign In'), command: 'affinidi.login' },
        }),
      ]
    }

    // If a tree item is expanded and there is no active session we need to refresh the tree from the top.
    context.treeDataProvider.refresh()

    return []
  }
}
