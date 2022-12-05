import { window, ProgressLocation, l10n } from 'vscode'

import { credentialsVaultService } from '../../auth/authentication-provider/credentialsVault'

import { configVaultService } from '../../auth/authentication-provider/configVault'

import { activeProjectState } from './activeProjectState'

import { iamState } from './iamState'

export async function setActiveProject(projectId: string): Promise<void> {
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Setting active project...'),
    },
    () => iamState.requireProjectSummary(projectId),
  )

  const storedSession = credentialsVaultService.getSession()
  const userId = storedSession?.account?.userId ?? null
  const configs = configVaultService.getConfigs()
  if (configs) {
    activeProjectState.setActiveProjectSummary(projectSummary)
    credentialsVaultService.setActiveProjectSummary(projectSummary)
  } else {
    const newConfigs = {
      [userId]: { activeProjectId: projectSummary.project.projectId },
    }

    activeProjectState.setActiveProjectSummary(projectSummary)
    credentialsVaultService.setActiveProjectSummary(projectSummary)
    configVaultService.setConfigs(newConfigs)
  }
}
