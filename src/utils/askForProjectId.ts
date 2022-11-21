import { ProjectDto } from '@affinidi/client-iam'
import { l10n } from 'vscode'

import { showQuickPick } from './showQuickPick'
import { projectsState } from '../states/projectsState'

export async function askForProjectId(): Promise<string | undefined> {
  const projects = projectsState.getProjects() ?? []

  if (projects.length === 0) {
    throw new Error(l10n.t('You need to have a project to generate this snippet'))
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
