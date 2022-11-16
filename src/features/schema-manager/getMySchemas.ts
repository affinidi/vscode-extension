import { Options, SchemaSearchScope } from '@affinidi/client-schema-manager'
import { schemaManagerClient } from './schemaManagerClient'

export const getMySchemas = async (
  input: {
    did: string
    scope?: SchemaSearchScope
  },
  options: Options,
) => {
  return schemaManagerClient.searchSchemas(
    {
      did: input.did,
      authorDid: input.did,
      scope: input.scope ?? 'default',
    },
    options,
  )
}
