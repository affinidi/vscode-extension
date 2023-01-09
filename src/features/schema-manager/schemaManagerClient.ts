import { SchemaManagerClient } from '@affinidi/client-schema-manager'

export const SCHEMA_MANAGER_API_URL =
  'https://affinidi-schema-manager.prod.affinity-project.org/api/v1'

export const schemaManagerClient = new SchemaManagerClient({
  apiUrl: SCHEMA_MANAGER_API_URL,
})


