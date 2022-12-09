import { iamState } from '../features/iam/iamState'
import { configVault } from './configVault'
import { credentialsVault } from './credentialsVault'

export async function updateCredentialsActiveProjectSummary() {
  const activeProjectId = await configVault.getActiveProjectId()
  if (activeProjectId) {
    credentialsVault.setActiveProjectSummary(
      await iamState.requireProjectSummary(activeProjectId),
    )
  } else {
    credentialsVault.delete('activeProjectSummary')
  }
}
