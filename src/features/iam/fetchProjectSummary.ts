import { ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation } from 'vscode'

import { authHelper } from '../../auth/authHelper'
import { projectMessage } from '../../messages/messages'
import { iamClient } from './iamClient'

export async function fetchProjectSummary(projectId: string): Promise<ProjectSummary> {
  const consoleAuthToken = await authHelper.getConsoleAuthToken()
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `${projectMessage.fetchProject}`,
    },
    () => iamClient.getProjectSummary({ projectId }, { consoleAuthToken }),
  )

  if (!projectSummary) {
    throw new Error(`${projectMessage.noProjectSummary}, ${projectId}`)
  }

  return projectSummary
}
