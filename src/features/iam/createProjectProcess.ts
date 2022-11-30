import { ProjectDto } from '@affinidi/client-iam'
import { ProgressLocation, window, l10n } from 'vscode'

import { authHelper } from '../../auth/authHelper'
import { logger } from '../../utils/logger'
import { iamClient } from './iamClient'

export const createProjectProcess = async (): Promise<ProjectDto | undefined> => {
  const projectName = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: l10n.t('Project Name'),
    prompt: l10n.t('Enter the project name'),
  })

  if (!projectName) {
    window.showErrorMessage(l10n.t('Project name is required'))
    return undefined
  }

  try {
    const consoleAuthToken = await authHelper.getConsoleAuthToken()
    const result = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: l10n.t('Creating Project...'),
      },
      async () => iamClient.createProject({ name: projectName }, { consoleAuthToken }),
    )

    window.showInformationMessage(l10n.t('Project created successfully'))

    return result
  } catch (error) {
    logger.error(error, 'Could not create project')
    window.showErrorMessage(l10n.t('Project could not be created, please try again later.'))
  }
}
