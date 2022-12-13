import { ProjectDto, ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation, EventEmitter, Disposable } from 'vscode'
import { configVault } from '../../config/configVault'
import { authHelper } from '../../auth/authHelper'
import { ext } from '../../extensionVariables'
import { projectMessage } from '../../messages/messages'
import { state } from '../../state'
import { iamClient } from './iamClient'
import { singletonPromise } from '../../utils/singletonPromise'

const PREFIX = 'iam:'
const storageKey = (input: string) => PREFIX + input

export class IamState {
  async listProjects(): Promise<ProjectDto[]> {
    return this.fetchProjects()
  }

  async getProjectById(projectId: string): Promise<ProjectDto | undefined> {
    return (await this.fetchProjects()).find((p) => p.projectId === projectId)
  }

  async requireActiveProject(): Promise<ProjectDto> {
    const activeProjectId = await configVault.requireActiveProjectId()
    const activeProject = await this.getProjectById(activeProjectId)
    if (!activeProject) {
      throw new Error(projectMessage.errorFetchingActiveProject)
    }
    return activeProject
  }

  async getInactiveProjects(): Promise<ProjectDto[]> {
    const activeProjectId = await configVault.requireActiveProjectId()
    return (await this.fetchProjects()).filter((project) => project.projectId !== activeProjectId)
  }

  async requireProjectSummary(projectId: string): Promise<ProjectSummary> {
    const projectSummary = await this.fetchProjectSummary(projectId)
    if (!projectSummary) {
      throw new Error(projectMessage.projectNotFound(projectId))
    }

    return projectSummary
  }

  clear() {
    state.clearByPrefix(PREFIX)
  }

  private fetchProjectSummary = singletonPromise(
    async (projectId: string): Promise<ProjectSummary | undefined> => {
      const key = storageKey(`summary:${projectId}`)
      const stored = ext.context.globalState.get<ProjectSummary>(key)
      if (stored) return stored

      const projectSummary = await window.withProgress(
        { location: ProgressLocation.Notification, title: projectMessage.fetchingProjectSummary },
        async () =>
          iamClient.getProjectSummary(
            { projectId },
            { consoleAuthToken: await authHelper.getConsoleAuthToken() },
          ),
      )

      await ext.context.globalState.update(key, projectSummary)

      return projectSummary
    },
  )

  private fetchProjects = singletonPromise(async (): Promise<ProjectDto[]> => {
    const key = storageKey('list')
    const stored = ext.context.globalState.get<ProjectDto[]>(key)
    if (stored) return stored

    const { projects } = await window.withProgress(
      { location: ProgressLocation.Notification, title: projectMessage.fetchingProjects },
      async () =>
        iamClient.listProjects({ consoleAuthToken: await authHelper.getConsoleAuthToken() }),
    )

    await ext.context.globalState.update(key, projects)

    return projects
  })
}

export const iamState = new IamState()
