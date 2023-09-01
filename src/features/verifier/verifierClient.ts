import { VerifierClient } from '@affinidi/client-verifier'
import { credentialsVault } from '../../config/credentialsVault'

const apiUrls = {
  prod: 'https://affinity-verifier.apse1.affinidi.io/api/v1',
  dev: 'https://affinity-verifier.apse1.dev.affinidi.io/api/v1',
}

export const VERIFIER_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const verifierClient = new VerifierClient({ apiUrl: VERIFIER_API_URL })
