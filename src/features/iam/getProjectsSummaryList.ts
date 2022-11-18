import { authHelper } from '../../auth/authHelper'
import { projectsState } from '../../states/projectsState'
import { fetchProjectSummary } from './fetchProjectSummary'
import { iamClient } from './iamClient'

export async function getProjectsSummaryList(): Promise<void> {
  const consoleAuthToken = await authHelper.getConsoleAuthToken()
  const { projects } = await iamClient.listProjects({ consoleAuthToken })

  // sort projects array in descending order on createdAt field
  const sortedProjects = projects.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  for await (const project of sortedProjects) {
    const projectSummary = await fetchProjectSummary(project.projectId)

    projectsState.setProject(projectSummary.project.projectId, projectSummary)
  }
}
