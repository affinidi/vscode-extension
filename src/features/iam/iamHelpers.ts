import { ProjectDto, ProjectSummary } from '@affinidi/client-iam'
import { showQuickPick } from '../../utils/showQuickPick'
import { projectsState } from '../../states/projectsState'
import { projectMessage } from '../../messages/messages'

async function askForProjectId(): Promise<string | undefined> {
  const projects = projectsState.getProjects() ?? []

  if (projects.length === 0) {
    throw new Error(projectMessage.projectRequired)
  }

  let project: ProjectDto | undefined = projects[0]?.project

  if (projects.length > 1) {
    project = await showQuickPick(
      projects.map((p) => [p.project.name, p.project]),
      { title: `${projectMessage.selectProject}` },
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
    throw new Error(`${projectMessage.noProjectSummary} ${projectId}`)
  }

  return projectSummary
}

export const iamHelpers = {
  askForProjectId,
  requireProjectSummary,
}
