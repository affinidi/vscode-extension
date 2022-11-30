import { ProjectDto, ProjectSummary } from '@affinidi/client-iam'
import { window, ProgressLocation, l10n } from 'vscode'
import { authHelper } from '../../auth/authHelper'
import { ext } from '../../extensionVariables'
import { iamClient } from './iamClient'

const PROJECTS_STORAGE_KEY = 'projects:list'

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
      throw new Error(l10n.t('Project not found: {0}', projectId))
    }

    return projectSummary
  }

  async clear() {
    await Promise.all(
      ext.context.globalState.keys().map(async (key) => {
        if (key.startsWith('projects:')) {
          await ext.context.globalState.update(key, undefined)
        }
      }),
    )
  }

  private async fetchProjectSummary(projectId: string): Promise<ProjectSummary | undefined> {
    const key = `projects:${projectId}:summary`

    const stored = ext.context.globalState.get<ProjectSummary>(key)
    if (stored) return stored

    const projectSummary = await window.withProgress(
      { location: ProgressLocation.Notification, title: l10n.t('Fetching project summary...') },
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
    const stored = ext.context.globalState.get<ProjectDto[]>(PROJECTS_STORAGE_KEY)
    if (stored) return stored

    const { projects } = await window.withProgress(
      { location: ProgressLocation.Notification, title: l10n.t('Fetching project list...') },
      async () =>
        iamClient.listProjects({ consoleAuthToken: await authHelper.getConsoleAuthToken() }),
    )

    await ext.context.globalState.update(PROJECTS_STORAGE_KEY, projects)

    return projects
  }
}

export const iamState = new IamState()
