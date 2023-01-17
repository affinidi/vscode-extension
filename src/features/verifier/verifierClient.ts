import { apiUrls, VerifierClient } from '@affinidi/client-verifier'
import { credentialsVault } from '../../config/credentialsVault'

export const VERIFIER_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const verifierClient = new VerifierClient({ apiUrl: VERIFIER_API_URL })
