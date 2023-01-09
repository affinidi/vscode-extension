import { ThemeIcon } from 'vscode'
import { ext } from '../extensionVariables'
import { authMessage } from './messages'
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
        label: authMessage.createAnAccountWithAffinidi,
        icon: new ThemeIcon('sign-in'),
        command: {
          title: authMessage.createAnAccount,
          command: 'affinidi.signUp',
        },
      }),
      new BasicTreeItem({
        label: authMessage.login,
        icon: new ThemeIcon('sign-in'),
        command: { title: authMessage.login, command: 'affinidi.login' },
      }),
    ]
  }
}
