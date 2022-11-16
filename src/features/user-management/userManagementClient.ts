import { UserManagementClient } from '@affinidi/client-user-management'

export const USER_MANAGEMENT_API_URL = 'https://console-user-management.apse1.affinidi.com/api/v1'

export const userManagementClient = new UserManagementClient({
  apiUrl: USER_MANAGEMENT_API_URL,
})
