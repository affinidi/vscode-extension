import { ProjectDto } from '@affinidi/client-iam'
import { ProgressLocation, window } from 'vscode'
import { authHelper } from '../../auth/authHelper'
import { logger } from '../../utils/logger'
import { iamClient } from './iamClient'
import { projectMessage } from '../../messages/messages'

export const createProjectProcess = async (name?: string): Promise<ProjectDto | undefined> => {
  const projectName =
    name ||
    (await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: projectMessage.projectName,
      prompt: projectMessage.enterProjectName,
    }))

  if (!projectName) {
    window.showErrorMessage(projectMessage.projectNameRequired)
    return undefined
  }

  try {
    const consoleAuthToken = await authHelper.getConsoleAuthToken()
    const project = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: projectMessage.creatingProject,
      },
      async () => iamClient.createProject({ name: projectName }, { consoleAuthToken }),
    )

    window.showInformationMessage(projectMessage.successfulProjectCreation)
    return project
  } catch (error) {
    logger.error(error, projectMessage.projectNotCreated)
    window.showErrorMessage(`${projectMessage.projectNotCreated} ${projectMessage.pleaseTryAgain}`)
  }
}
