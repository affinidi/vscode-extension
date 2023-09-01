import { IssuanceClient } from '@affinidi/client-issuance'
import { credentialsVault } from '../../config/credentialsVault'

const apiUrls = {
  prod: 'https://console-vc-issuance.apse1.affinidi.io/api/v1',
  dev: 'https://console-vc-issuance.apse1.dev.affinidi.io/api/v1',
}

export const ISSUANCE_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const issuanceClient = new IssuanceClient({ apiUrl: ISSUANCE_API_URL })
