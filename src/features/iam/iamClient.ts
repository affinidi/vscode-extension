import { IamClient } from '@affinidi/client-iam'
import { credentialsVault } from '../../config/credentialsVault'

const apiUrls = {
  prod: 'https://affinidi-iam.apse1.affinidi.com/api/v1',
  dev: 'https://affinidi-iam.apse1.dev.affinidi.io/api/v1',
}

export const AFFINIDI_IAM_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const iamClient = new IamClient({ apiUrl: AFFINIDI_IAM_API_URL })
