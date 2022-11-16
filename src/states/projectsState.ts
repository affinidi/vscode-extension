import { l10n } from 'vscode'
import { ext } from '../extensionVariables'
import { ProjectSummary } from '../services/iamService'

const STORAGE_KEY = 'projects'

type Projects = Record<string, ProjectSummary>

export const projectsState = () => {
  const setProjects = (projects: ProjectSummary[]) => {
    const projectsObject = Object.fromEntries(
      projects.map((item) => [item.project.projectId, item]),
    )

    ext.context.globalState.update(STORAGE_KEY, projectsObject)
  }

  const getProjects = (): Projects | undefined => {
    return ext.context.globalState.get(STORAGE_KEY)
  }

  const getProjectById = (projectId: string) => {
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

  return {
    setProject,
    setProjects,
    getProjects,
    getProjectById,
  }
}
