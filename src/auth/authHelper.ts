import { commands } from 'vscode'
import { ext } from '../extensionVariables'
import { showQuickPick } from '../utils/showQuickPick'
import { labels } from './messages'

async function getConsoleAuthToken() {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  })

  return session.accessToken
}

export const continueWithoutLogin = async (): Promise<boolean> => {
  const isLoggedIn = (await ext.authProvider.isLoggedIn()) || false
  if (!isLoggedIn) {
    const continueWithoutLoginPick = await showQuickPick(
      [
        [labels.login, 'Login'],
        [labels.continueWithoutLogin, 'notLoggedIn'],
      ],
      {
        title: 'Choose to continue without login',
      },
    )

    if (continueWithoutLoginPick === 'Login') {
      await commands.executeCommand('affinidi.authenticate')
      return true
    }
  }
  return false
}

export const authHelper = {
  getConsoleAuthToken,
  continueWithoutLogin,
}
