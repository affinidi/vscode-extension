import { ProjectSummary } from '@affinidi/client-iam'
import { l10n } from 'vscode'

import { projectsState } from '../states/projectsState'

export function requireProjectSummary(projectId: string): ProjectSummary {
  const projectSummary = projectsState.getProjectById(projectId)

  if (!projectSummary) {
    throw new Error(l10n.t(`Could not find project summary: {0}`, projectId))
  }

  return projectSummary
}
