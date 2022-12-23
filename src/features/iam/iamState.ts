import { ProjectDto, ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation, EventEmitter, Disposable } from 'vscode'
import { configVault } from '../../config/configVault'
import { authHelper } from '../../auth/authHelper'
import { projectMessage } from '../../messages/messages'
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

  async getActiveProject(): Promise<ProjectDto | undefined> {
    const activeProjectId = await configVault.getActiveProjectId()
    if (!activeProjectId) {
      throw new Error(projectMessage.errorFetchingActiveProject)
    }

    return this.getProjectById(activeProjectId)
  }

  async getInactiveProjects(): Promise<ProjectDto[]> {
    const activeProjectId = await configVault.getActiveProjectId()
    return (await this.fetchProjects()).filter((project) => project.projectId !== activeProjectId)
  }

  async getProjectSummary(projectId: string): Promise<ProjectSummary | undefined> {
    return this.fetchProjectSummary(projectId)
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

    const { projects } = await window.withProgress(
      { location: ProgressLocation.Notification, title: projectMessage.fetchingProjects },
      async () =>
        iamClient.listProjects({ consoleAuthToken: await authHelper.getConsoleAuthToken() }),
    )

    state.update(key, projects)
    this.onDidUpdateEmitter.fire()

    return projects
  }
}

export const iamState = new IamState()
