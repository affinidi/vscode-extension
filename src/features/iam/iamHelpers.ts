import { ProjectDto, ProjectSummary } from '@affinidi/client-iam'
import { l10n } from 'vscode'

import { showQuickPick } from '../../utils/showQuickPick'
import { projectsState } from '../../states/projectsState'

export const PROJECT_REQUIRED_ERROR_MESSAGE = l10n.t(
  'You need to have a project to perform this operation',
)

async function askForProjectId(): Promise<string | undefined> {
  const projects = projectsState.getProjects() ?? []

  if (projects.length === 0) {
    throw new Error(PROJECT_REQUIRED_ERROR_MESSAGE)
  }

  let project: ProjectDto | undefined = projects[0]?.project

  if (projects.length > 1) {
    project = await showQuickPick(
      projects.map((p) => [p.project.name, p.project]),
      { title: l10n.t('Select a project') },
    )
  }

  return project?.projectId
}

function requireProjectSummary(projectId: string | undefined): ProjectSummary {
  if (!projectId) {
    throw new Error(l10n.t('Project ID is not provided'))
  }

  const projectSummary = projectsState.getProjectById(projectId)

  if (!projectSummary) {
    throw new Error(l10n.t(`Could not find project summary: {0}`, projectId))
  }

  return projectSummary
}

export const iamHelpers = {
  askForProjectId,
  requireProjectSummary,
}
