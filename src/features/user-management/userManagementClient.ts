import { apiUrls, UserManagementClient } from '@affinidi/client-user-management'
import { credentialsVault } from '../../config/credentialsVault'

export const USER_MANAGEMENT_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const userManagementClient = new UserManagementClient({ apiUrl: USER_MANAGEMENT_API_URL })
