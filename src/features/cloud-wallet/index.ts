import { credentialsVault } from '../../config/credentialsVault'

const apiUrls = {
  prod: 'https://cloud-wallet-api.prod.affinity-project.org/api/v1',
  staging: 'https://cloud-wallet-api.staging.affinity-project.org/api/v1',
  dev: 'https://cloud-wallet-api.apse1.dev.affinidi.io/api/v1',
}

export const CLOUD_WALLET_API_URL = apiUrls[credentialsVault.getEnvironment()]
