import { VerifierClient } from '@affinidi/client-verifier'

export const VERIFIER_API_URL = 'https://affinity-verifier.prod.affinity-project.org/api/v1'

export const verifierClient = new VerifierClient({ apiUrl: VERIFIER_API_URL })
