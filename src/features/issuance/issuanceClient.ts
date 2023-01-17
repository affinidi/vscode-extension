import { apiUrls, IssuanceClient } from '@affinidi/client-issuance'
import { credentialsVault } from '../../config/credentialsVault'

export const ISSUANCE_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const issuanceClient = new IssuanceClient({ apiUrl: ISSUANCE_API_URL })
