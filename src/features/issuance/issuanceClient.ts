import { IssuanceClient } from '@affinidi/client-issuance'

export const ISSUANCE_API_URL = 'https://console-vc-issuance.apse1.affinidi.com/api/v1'

export const issuanceClient = new IssuanceClient({ apiUrl: ISSUANCE_API_URL })
