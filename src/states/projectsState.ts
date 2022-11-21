import { ProjectSummary } from '@affinidi/client-iam'
import { l10n } from 'vscode'
import { ext } from '../extensionVariables'

const STORAGE_KEY = 'projects'

const getProjects = (): ProjectSummary[] | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const getProjectById = (projectId?: string) => {
  if (!projectId) {
    throw new Error(l10n.t('Project ID is not provided'))
  }

  const projects = getProjects()
  const selectedProject = projects?.find(({ project }) => project?.projectId === projectId)

  if (!selectedProject) {
    throw new Error(l10n.t('Project does not exist.'))
  }

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
