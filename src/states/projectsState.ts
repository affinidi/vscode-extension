import { ProjectSummary } from '@affinidi/client-iam'
import { ext } from '../extensionVariables'
import { projectMessage } from '../messages/messages'

const STORAGE_KEY = 'projects'

const getProjects = (): ProjectSummary[] | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const getProjectById = (projectId?: string) => {
  if (!projectId) {
    throw new Error(projectMessage.missingProjectID)
  }

  const projects = getProjects()
  const selectedProject = projects?.find(({ project }) => project?.projectId === projectId)

  if (!selectedProject) {
    throw new Error(projectMessage.projectDoesNotExist)
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
