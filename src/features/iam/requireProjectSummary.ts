import { Options, ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation, l10n } from 'vscode'
import { iamClient } from './iamClient'

export async function requireProjectSummary(
  projectId: string,
  options: Options,
): Promise<ProjectSummary> {
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Fetching project information...'),
    },
    () => iamClient.getProjectSummary({ projectId }, options),
  )

  if (!projectSummary) {
    throw new Error(l10n.t(`Could not find project summary: {0}`, projectId))
  }

  return projectSummary
}
