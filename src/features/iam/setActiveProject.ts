import { window, ProgressLocation, l10n } from 'vscode'
import {
  ACTIVE_PROJECT_ID_KEY_NAME,
  ACTIVE_PROJECT_SUMMARY_KEY_NAME,
  configVaultService,
  credentialsVaultService,
} from '../../auth/authentication-provider/vault'

import { fetchProjectSummary } from './fetchProjectSummary'

export async function setActiveProject(projectId: string): Promise<void> {
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Setting active project...'),
    },
    () => fetchProjectSummary(projectId),
  )

  configVaultService.set(ACTIVE_PROJECT_ID_KEY_NAME, JSON.stringify(projectId))
  credentialsVaultService.set(ACTIVE_PROJECT_SUMMARY_KEY_NAME, JSON.stringify(projectSummary))
}
