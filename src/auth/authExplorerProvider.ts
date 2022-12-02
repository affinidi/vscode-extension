import { ThemeIcon } from 'vscode'
import { ext } from '../extensionVariables'
import { authMessage, labels } from '../messages/messages'
import { ExplorerTree } from '../tree/explorerTree'
import { ExplorerTreeItem } from '../tree/explorerTreeItem'
import { ExplorerProvider, ExplorerResourceTypes } from '../tree/types'

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
        label: labels.createAnAccountWithAffinidi,
        icon: new ThemeIcon('sign-in'),
        command: {
          title: authMessage.createAnAccount,
          command: 'affinidi.signUp',
        },
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.login,
        label: labels.signIn,
        icon: new ThemeIcon('sign-in'),
        command: { title: labels.signIn, command: 'affinidi.login' },
      }),
    ]
  }
}
