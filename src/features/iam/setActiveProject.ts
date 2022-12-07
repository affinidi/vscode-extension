import { window, ProgressLocation } from 'vscode'
import { credentialsVaultService } from '../../auth/authentication-provider/credentialsVault'
import { configVaultService } from '../../auth/authentication-provider/configVault'
import { iamState } from './iamState'
import { projectMessage } from '../../messages/messages'

export async function setActiveProject(projectId: string): Promise<void> {
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: projectMessage.settingActiveProject,
    },
    () => iamState.requireProjectSummary(projectId),
  )

  await iamState.setActiveProjectSummary(projectSummary)
  configVaultService.setConfigs(projectId)
  credentialsVaultService.setActiveProjectSummary(projectSummary)
}
