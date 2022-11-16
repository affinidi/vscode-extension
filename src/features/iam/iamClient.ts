import { IamClient } from '@affinidi/client-iam'

export const AFFINIDI_IAM_API_URL = 'https://affinidi-iam.apse1.affinidi.com/api/v1'

export const iamClient = new IamClient({ apiUrl: AFFINIDI_IAM_API_URL })
