import { ProjectDto, ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation, EventEmitter, Disposable } from 'vscode'
import { configVault } from '../../config/configVault'
import { authHelper } from '../../auth/authHelper'
import { projectMessage } from './messages'
import { state } from '../../state'
import { iamClient } from './iamClient'

const PREFIX = 'iam:'
const storageKey = (input: string) => PREFIX + input

export class IamState {
  private readonly onDidUpdateEmitter = new EventEmitter<void>()

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

  onDidUpdate(listener: () => unknown): Disposable {
    return Disposable.from(
      this.onDidUpdateEmitter.event(listener),
      state.onDidClear((prefix) => {
        if (!prefix || prefix.startsWith(PREFIX)) {
          listener()
        }
      }),
    )
  }

  private async fetchProjectSummary(projectId: string): Promise<ProjectSummary | undefined> {
    const key = storageKey(`summary:${projectId}`)
    const stored = state.get<ProjectSummary>(key)
    if (stored) return stored

    const projectSummary = await window.withProgress(
      { location: ProgressLocation.Notification, title: projectMessage.fetchingProjectSummary },
      async () =>
        iamClient.getProjectSummary(
          { projectId },
          { consoleAuthToken: await authHelper.getConsoleAuthToken() },
        ),
    )

    state.update(key, projectSummary)
    this.onDidUpdateEmitter.fire()

    return projectSummary
  }

  private async fetchProjects(): Promise<ProjectDto[]> {
    const key = storageKey('list')
    const stored = state.get<ProjectDto[]>(key)
    if (stored) return stored

    const { projects } = await iamClient.listProjects({
      consoleAuthToken: await authHelper.getConsoleAuthToken(),
    })

    state.update(key, projects)
    this.onDidUpdateEmitter.fire()

    return projects
  }
}

export const iamState = new IamState()
