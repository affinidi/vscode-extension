import { UserManagementClient } from '@affinidi/client-user-management'
import { credentialsVault } from '../../config/credentialsVault'

const apiUrls = {
  prod: 'https://console-user-management.apse1.affinidi.com/api/v1',
  dev: 'https://user-management.apse1.dev.affinidi.io/api/v1',
}

export const USER_MANAGEMENT_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const userManagementClient = new UserManagementClient({ apiUrl: USER_MANAGEMENT_API_URL })
