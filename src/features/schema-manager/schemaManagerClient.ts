import { apiUrls, SchemaManagerClient } from '@affinidi/client-schema-manager'
import { credentialsVault } from '../../config/credentialsVault'

export const SCHEMA_MANAGER_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const schemaManagerClient = new SchemaManagerClient({ apiUrl: SCHEMA_MANAGER_API_URL })
