import { apiUrls, IamClient } from '@affinidi/client-iam'
import { credentialsVault } from '../../config/credentialsVault'

export const AFFINIDI_IAM_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const iamClient = new IamClient({ apiUrl: AFFINIDI_IAM_API_URL })
