import { ProgressLocation, window } from 'vscode'
import { authHelper } from '../../auth/authHelper'
import { iamClient } from './iamClient'
import { projectMessage } from './messages'
import { notifyError } from '../../utils/notifyError'

export const createProjectProcess = async (): Promise<void> => {
  const projectName = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: projectMessage.projectName,
    prompt: projectMessage.enterProjectName,
  })

  if (!projectName) {
    window.showErrorMessage(projectMessage.projectNameRequired)
    return undefined
  }

  try {
    const consoleAuthToken = await authHelper.getConsoleAuthToken()
    await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: projectMessage.creatingProject,
      },
      async () => iamClient.createProject({ name: projectName }, { consoleAuthToken }),
    )

    window.showInformationMessage(projectMessage.successfulProjectCreation)
  } catch (error: unknown) {
    notifyError(error, projectMessage.projectNotCreated)
  }
}
