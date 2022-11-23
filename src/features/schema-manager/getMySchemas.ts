import { Options, SchemaSearchScope } from '@affinidi/client-schema-manager'
import { schemasState } from '../../states/schemasState'
import { schemaManagerClient } from './schemaManagerClient'

export const getMySchemas = async (
  input: {
    did: string
    scope?: SchemaSearchScope
  },
  options: Options,
) => {
  // let schemas = schemasState.getSchemas()?.filter(schema => schema.)
  let schemas = schemasState.getSchemas()

  if (!schemas?.length) {
    const result = await schemaManagerClient.searchSchemas(
      {
        did: input.did,
        authorDid: input.did,
        scope: input.scope ?? 'default',
      },
      options,
    )

    schemas = result.schemas

    schemasState.setSchemas(schemas)
  }

  return schemas
}
