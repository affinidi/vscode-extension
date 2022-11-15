import { apiFetch, buildURL, generateApiKeyHeader } from '../api-client/api-fetch'

export type SchemaEntity = {
  id: string
  authorDid: string
  createdAt: Date
  description: string
  jsonLdContextUrl: string
  jsonSchemaUrl: string
  namespace: string | null
  parentId: string | null
  version: number
  revision: number
  type: string
}

export type SchemaSearchScope = 'public' | 'unlisted' | 'default'

export type ResponseType = {
  count: number
  schemas: SchemaEntity[]
}

export const SCHEMA_MANAGER_API_BASE =
  'https://affinidi-schema-manager.prod.affinity-project.org/api'

type GetMySchemasProps = {
  did: string
  scope?: SchemaSearchScope
  apiKeyHash: string
}

export const getMySchemas = async ({
  did,
  scope = 'default',
  apiKeyHash,
}: GetMySchemasProps): Promise<ResponseType> => {
  const url = buildURL(SCHEMA_MANAGER_API_BASE, '/v1/schemas', {
    did,
    authorDid: did,
    scope,
  })

  return apiFetch({
    method: 'GET',
    endpoint: url,
    headers: generateApiKeyHeader(apiKeyHash),
  })
}

export const getSchema = async (schemaId: string): Promise<SchemaEntity | undefined> => {
  const url = buildURL(SCHEMA_MANAGER_API_BASE, `/v1/schemas/${schemaId}`)

  try {
    return await apiFetch({
      method: 'GET',
      endpoint: url,
    })
  } catch (error: any) {
    if (error.code === 'SCH-9') {
      return undefined
    }

    throw error
  }
}
