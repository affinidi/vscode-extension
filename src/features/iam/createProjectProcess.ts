import { ProjectDto } from '@affinidi/client-iam'
import { ProgressLocation, window } from 'vscode'

import { authHelper } from '../../auth/authHelper'
import { logger } from '../../utils/logger'
import { iamClient } from './iamClient'
import { fetchProjectSummary } from './fetchProjectSummary'
import { projectsState } from '../../states/projectsState'
import { errorMessage, projectMessage } from '../../messages/messages'

export const createProjectProcess = async (): Promise<ProjectDto | undefined> => {
  const projectName = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: `${projectMessage.projectName}`,
    prompt: `${projectMessage.enterProjectName}`,
  })

  if (!projectName) {
    window.showErrorMessage(projectMessage.projectNameRequired)
    return undefined
  }

  try {
    const consoleAuthToken = await authHelper.getConsoleAuthToken()
    const result = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: `${projectMessage.creatingProject}`,
      },
      async () => iamClient.createProject({ name: projectName }, { consoleAuthToken }),
    )

    window.showInformationMessage(projectMessage.successfulProjectCreation)

    const projectSummary = await fetchProjectSummary(result.projectId)

    projectsState.setProject(projectSummary)

    return result
  } catch (error) {
    logger.error(error, projectMessage.projectNotCreated)
    window.showErrorMessage(`${projectMessage.projectNotCreated} ${projectMessage.pleaseTryAgain}`)
  }
}
