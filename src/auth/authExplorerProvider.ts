import { ThemeIcon } from 'vscode'
import { ext } from '../extensionVariables'
import { authMessage, labels } from './messages'
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
        label: labels.createAnAccountWithAffinidi,
        icon: new ThemeIcon('sign-in'),
        command: {
          title: authMessage.createAnAccount,
          command: 'affinidi.signUp',
        },
      }),
      new BasicTreeItem({
        label: labels.login,
        icon: new ThemeIcon('sign-in'),
        command: { title: labels.login, command: 'affinidi.login' },
      }),
    ]
  }
}
