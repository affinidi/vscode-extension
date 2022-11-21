import { ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation, l10n } from 'vscode'

import { authHelper } from '../../auth/authHelper'
import { iamClient } from './iamClient'

export async function fetchProjectSummary(projectId: string): Promise<ProjectSummary> {
  const consoleAuthToken = await authHelper.getConsoleAuthToken()
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Fetching project information...'),
    },
    () => iamClient.getProjectSummary({ projectId }, { consoleAuthToken }),
  )

  if (!projectSummary) {
    throw new Error(l10n.t(`Could not find project summary: {0}`, projectId))
  }

  return projectSummary
}
