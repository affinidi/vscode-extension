import { Options, ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation } from 'vscode'
import { projectMessage } from '../../messages/messages'
import { iamClient } from './iamClient'

export async function fetchProjectSummary(
  projectId: string,
  options: Options,
): Promise<ProjectSummary> {
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `${projectMessage.fetchProject}`,
    },
    () => iamClient.getProjectSummary({ projectId }, options),
  )

  if (!projectSummary) {
    throw new Error(`${projectMessage.noProjectSummary}, ${projectId}`)
  }

  return projectSummary
}
