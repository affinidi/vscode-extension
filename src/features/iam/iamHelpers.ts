import { window, ProgressLocation } from 'vscode'
import { labels } from '../../messages/messages'
import { projectMessage } from './messages'
import { iamState } from './iamState'
import { authHelper } from '../../auth/authHelper'
import { iamClient } from './iamClient'
import { ext } from '../../extensionVariables'

async function askForWalletUrl(): Promise<string | undefined> {
  const wallet = await window.showInputBox({
    value: 'http://localhost:3000/holder/claim',
    prompt: labels.selectWallet,
  })

  return wallet
}

async function createDefaultProject(): Promise<void> {
  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: projectMessage.creatingDefaultProject,
    },
    async () =>
      iamClient.createProject(
        { name: 'Default Project' },
        { consoleAuthToken: await authHelper.getConsoleAuthToken() },
      ),
  )

  iamState.clear()
  ext.explorerTree.refresh()
}

export const iamHelpers = {
  askForWalletUrl,
  createDefaultProject,
}
