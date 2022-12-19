import { configVault } from './configVault'
import { credentialsVault } from './credentialsVault'

export function validateVaultFiles() {
  if (!configVault.isValid() || !credentialsVault.isValid()) {
    credentialsVault.clear()
    configVault.clear()
  }
}
