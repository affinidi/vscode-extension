import { ProgressLocation, window } from 'vscode'
import { authHelper } from '../../auth/authHelper'
import { ext } from '../../extensionVariables'
import { projectMessage } from '../../messages/messages'
import { BasicTreeItemWithProject } from '../../tree/basicTreeItemWithProject'
import { notifyError } from '../../utils/notifyError'
import { iamClient } from './iamClient'

const renameProject = async (input: { projectId: string; name: string }) => {
  const { projectId } = input
  const { name } = input

  try {
    const consoleAuthToken = await authHelper.getConsoleAuthToken()
    const data = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: projectMessage.renameProject,
      },
      async () => {
        return iamClient.patchProject({ projectId, name: { name } }, { consoleAuthToken })
      },
    )

    window.showInformationMessage(projectMessage.projectRenamed)
    ext.outputChannel.appendLine(JSON.stringify(data, null, 2))
    ext.outputChannel.show()
  } catch (error: unknown) {
    notifyError(error, projectMessage.projectRenameFailed)
    ext.outputChannel.appendLine(JSON.stringify(error, null, 2))
  }
}

const activateRenameProject = async (element: BasicTreeItemWithProject) => {
  const { projectId } = element
  const name = await window.showInputBox({
    prompt: `Enter the new name for the project "${element.label}":`,
  })

  if (!name) return

  if (name) {
    await renameProject({ projectId, name })
  }
}

export const renameProjectService = { activateRenameProject, renameProject }
