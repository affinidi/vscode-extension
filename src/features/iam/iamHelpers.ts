import { window, ProgressLocation } from 'vscode'
import { projectMessage, labels } from './messages'
import { iamState } from './iamState'
import { authHelper } from '../../auth/authHelper'
import { iamClient } from './iamClient'
import { ext } from '../../extensionVariables'
import { notifyError } from '../../utils/notifyError'

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

const renameProject = async ({ projectId }: { projectId: string }) => {
  const project = await iamState.getProjectById(projectId)
  if (!project) return
  const name = await window.showInputBox({
    prompt: `Enter the new name for the project "${project.name}":`,
  })
  if (!name) return

  try {
    const consoleAuthToken = await authHelper.getConsoleAuthToken()
    const data = await window.withProgress(
      {
        location: ProgressLocation.Notification,
      },
      () => {
        return iamClient.patchProject(projectId, { name }, { consoleAuthToken })
      },
    )

    window.showInformationMessage(projectMessage.projectRenamed)
    ext.outputChannel.appendLine(JSON.stringify(data, null, 2))
    ext.outputChannel.show()

    iamState.clear()
    ext.explorerTree.refresh()
  } catch (error: unknown) {
    notifyError(error, projectMessage.projectRenameFailed)
  }
}

export const iamHelpers = {
  askForWalletUrl,
  createDefaultProject,
  renameProject,
}
