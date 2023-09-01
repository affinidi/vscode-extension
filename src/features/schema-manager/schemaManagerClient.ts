import { SchemaManagerClient } from '@affinidi/client-schema-manager'
import { credentialsVault } from '../../config/credentialsVault'
import { logger } from '../../utils/logger'

const apiUrls = {
  prod: 'https://affinidi-schema-manager.apse1.affinidi.io/api/v1',
  dev: 'https://affinidi-schema-manager.apse1.dev.affinidi.io/api/v1',
}

export const SCHEMA_MANAGER_API_URL = apiUrls[credentialsVault.getEnvironment()]

export const schemaManagerClient = new SchemaManagerClient({ apiUrl: SCHEMA_MANAGER_API_URL })
