import { ProjectSummary } from '@affinidi/client-iam'
import { l10n } from 'vscode'
import { ext } from '../extensionVariables'

const STORAGE_KEY = 'projects'

type Projects = Record<string, ProjectSummary>

const setProjects = (projects: ProjectSummary[]) => {
  const projectsObject = Object.fromEntries(projects.map((item) => [item.project.projectId, item]))

  ext.context.globalState.update(STORAGE_KEY, projectsObject)
}

const getProjects = (): Projects | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const getProjectById = (projectId?: string) => {
  if (!projectId) {
    throw new Error(l10n.t('Project ID is not provided'))
  }

  const projects = getProjects()
  const selectedProject = projects?.[projectId]

  if (!selectedProject) {
    throw new Error(l10n.t('Project does not exist.'))
  }

  return selectedProject
}

const setProject = (projectId: string, project: ProjectSummary) => {
  const projects = getProjects()

  ext.context.globalState.update(STORAGE_KEY, {
    ...projects,
    [projectId]: project,
  })
}

export const projectsState = {
  setProject,
  setProjects,
  getProjects,
  getProjectById,
}
