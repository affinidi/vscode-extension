import { window, ProgressLocation, l10n } from 'vscode'
import { credentialsVaultService } from '../../auth/authentication-provider/credentialsVault'
import { configVaultService } from '../../auth/authentication-provider/configVault'
import { activeProjectState } from './activeProjectState'
import { iamState } from './iamState'
import { projectMessage } from '../../messages/messages'

export async function setActiveProject(projectId: string): Promise<void> {
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: projectMessage.activeProject,
    },
    () => iamState.requireProjectSummary(projectId),
  )

  const storedSession = credentialsVaultService.getSession()
  const userId = storedSession ? storedSession.account.userId : ''

  activeProjectState.setActiveProjectSummary(projectSummary)
  configVaultService.setConfigs(userId, projectId)
  credentialsVaultService.setActiveProjectSummary(projectSummary)
}
