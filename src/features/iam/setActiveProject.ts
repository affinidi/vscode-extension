import { window, ProgressLocation, l10n } from 'vscode'
import {
  ACTIVE_PROJECT_SUMMARY_KEY_NAME,
  configVaultService,
  credentialsVaultService,
  SESSION_KEY_NAME,
  CONFIGS_KEY_NAME,
} from '../../auth/authentication-provider/vault'
import { activeProjectSummaryState } from '../../states/activeProjectSummaryState'

import { fetchProjectSummary } from './fetchProjectSummary'

export async function setActiveProject(projectId: string): Promise<void> {
  const projectSummary = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Setting active project...'),
    },
    () => fetchProjectSummary(projectId),
  )

  const storedSession = credentialsVaultService.get(SESSION_KEY_NAME)
  const session = JSON.parse(storedSession)
  const { userId } = session.account

  const configs = {
    [userId]: { activeProjectId: projectSummary.project.projectId },
  }

  activeProjectSummaryState.setActiveProjectSummary(projectSummary)
  configVaultService.set(CONFIGS_KEY_NAME, JSON.stringify(configs))
  credentialsVaultService.set(ACTIVE_PROJECT_SUMMARY_KEY_NAME, JSON.stringify(projectSummary))
}
