import { ProjectDto, ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation, l10n } from 'vscode'
import { configVaultService } from '../../auth/authentication-provider/configVault'
import { authHelper } from '../../auth/authHelper'
import { ext } from '../../extensionVariables'
import { projectMessage } from '../../messages/messages'
import { state } from '../../state'
import { iamClient } from './iamClient'

const PREFIX = 'iam:'
const storageKey = (input: string) => PREFIX + input

export class IamState {
  async listProjects(): Promise<ProjectDto[]> {
    return this.fetchProjects()
  }

  async getProjectById(projectId: string): Promise<ProjectDto | undefined> {
    return (await this.fetchProjects()).find((p) => p.projectId === projectId)
  }

  async requireProjectSummary(projectId: string): Promise<ProjectSummary> {
    const projectSummary = await this.fetchProjectSummary(projectId)
    if (!projectSummary) {
      throw new Error(projectMessage.projectNotFound(projectId))
    }

    return projectSummary
  }

  getActiveProjectSummary = (): ProjectSummary | undefined => {
    return ext.context.globalState.get(storageKey('activeProjectSummary'))
  }

  public async setActiveProjectSummary(projectSummary: ProjectSummary): Promise<void> {
    await ext.context.globalState.update(storageKey('activeProjectSummary'), projectSummary)
  }

  async clear() {
    await state.clear(PREFIX)
  }

  private async fetchProjectSummary(projectId: string): Promise<ProjectSummary | undefined> {
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
  }

  private async fetchProjects(): Promise<ProjectDto[]> {
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
  }
}

export const iamState = new IamState()
