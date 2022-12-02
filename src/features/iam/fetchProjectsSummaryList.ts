import { authHelper } from '../../auth/authHelper'
import { projectsState } from '../../states/projectsState'
import { fetchProjectSummary } from './fetchProjectSummary'
import { iamClient } from './iamClient'

export async function fetchProjectsSummaryList(): Promise<void> {
  const consoleAuthToken = await authHelper.getConsoleAuthToken()
  const { projects } = await iamClient.listProjects({ consoleAuthToken })

  // sort projects array in descending order on createdAt field
  const sortedProjects = projects.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  await Promise.all(
    sortedProjects.map(async (project) => {
      const projectSummary = await fetchProjectSummary(project.projectId, { consoleAuthToken })
      projectsState.setProject(projectSummary)
    }),
  )
}
