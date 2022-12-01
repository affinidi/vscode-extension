import { ProjectSummary } from '@affinidi/client-iam'
import { l10n } from 'vscode'
import { ext } from '../extensionVariables'

const STORAGE_KEY = 'projects'

export const NO_PROJECT_ERROR_MESSAGE = l10n.t('Project does not exist.')

const getProjects = (): ProjectSummary[] | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const getProjectById = (projectId?: string) => {
  const projects = getProjects()
  const selectedProject = projects?.find(({ project }) => project?.projectId === projectId)

  return selectedProject
}

const setProject = (projectSummary: ProjectSummary) => {
  const projects = getProjects() ?? []

  const index = projects?.findIndex(
    ({ project }) => project?.projectId === projectSummary.project.projectId,
  )

  if (projects[index]) {
    projects[index] = projectSummary
  } else {
    projects.push(projectSummary)
  }

  ext.context.globalState.update(STORAGE_KEY, projects)
}

const clear = () => {
  ext.context.globalState.update(STORAGE_KEY, undefined)
}

export const projectsState = {
  setProject,
  getProjects,
  getProjectById,
  clear,
}
