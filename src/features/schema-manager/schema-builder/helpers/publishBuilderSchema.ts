import { SchemaField, SchemaFieldType, generate } from '@affinidi/affinidi-vc-schemas'
import { SchemaDto } from '@affinidi/client-schema-manager'
import { projectsState } from '../../../../states/projectsState'
import { schemaManagerClient } from '../../schemaManagerClient'
import { BuilderAttribute, BuilderSchema } from '../helpers'

function attributesToFields(nested: BuilderAttribute[], all: BuilderAttribute[]): SchemaField[] {
  return nested.map<SchemaField>((attribute) => {
    const children = all.filter(a => a.parentId === attribute.id)
    return {
      name: attribute.name,
      description: attribute.description ?? null,
      type: attribute.type as SchemaFieldType,
      required: attribute.isRequired,
      ...children.length > 0 && { nested: attributesToFields(children, all) },
    }
  })
}

const generateSchemaFilesMetadata = (host: string, schemaId: string) => {
  const jsonSchemaFilename = `${schemaId}.json`
  const jsonLdContextFilename = `${schemaId}.jsonld`

  return {
    jsonSchemaFilename,
    jsonLdContextFilename,
    jsonSchemaUrl: `${host}/${jsonSchemaFilename}`,
    jsonLdContextUrl: `${host}/${jsonLdContextFilename}`,
  }
}

const generateSchemaId = (input: {
  namespace: string | null
  type: string
  version: number
  revision: number
}) => {
  const namespacePart = input.namespace ? `@${input.namespace}/` : ''
  return `${namespacePart}${input.type}V${input.version}-${input.revision}`
}

const getNextVersion = ({ version, revision }: { version: number; revision: number }) =>
  revision === 999 ? [version + 1, 0] : [version, revision + 1]

async function generateNextVersion(input: { type: string; scope: 'public' | 'unlisted'; did: string; apiKeyHash: string }) {
  const { schemas } = await schemaManagerClient.searchSchemas({
    did: input.did,
    type: input.type,
    scope: input.scope,
    limit: 1,
  }, { apiKeyHash: input.apiKeyHash })

  return schemas.length > 0
    ? getNextVersion({
        version: schemas[0].version,
        revision: schemas[0].revision,
      })
    : [1, 0]
}

export async function publishBuilderSchema(schema: BuilderSchema, projectId: string): Promise<SchemaDto> {
  const { apiKey: { apiKeyHash }, wallet: { did } } = projectsState.getProjectById(projectId)

  const scope = schema.isPublic ? 'public' : 'unlisted'
  const [version, revision] = await generateNextVersion({ type: schema.type, scope, did, apiKeyHash })

  const schemaName = generateSchemaId({
    namespace: schema.isPublic ? null : did,
    type: schema.type,
    version,
    revision,
  })

  const { jsonSchemaUrl, jsonLdContextUrl } = generateSchemaFilesMetadata(
    'https://schema.affinidi.com',
    schemaName,
  )

  const type = schema.type
  const description = schema.description ?? null

  const { jsonSchema, jsonLdContext } = generate(
    {
      description,
      type,
      version: Number(version),
      revision: Number(revision),
      jsonLdContextUrl,
      jsonSchemaUrl,
    },
    attributesToFields(schema.attributes.filter(a => !a.parentId), schema.attributes),
  )

  const createSchemaInput = {
    authorDid: did,
    parentId: null,
    scope,
    type,
    description,
    version,
    revision,
    jsonSchema,
    jsonLdContext,
  }

  return schemaManagerClient.createSchema({
    authorDid: did,
    parentId: null,
    scope,
    type,
    description,
    version,
    revision,
    jsonSchema,
    jsonLdContext,
  }, { apiKeyHash })
}
