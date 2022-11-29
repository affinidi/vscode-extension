import type { SchemaDto } from '@affinidi/client-schema-manager'
import { SchemaField, SchemaFieldType, generate } from '@affinidi/affinidi-vc-schemas'
import type { BuilderAttribute, BuilderSchema } from './SchemaBuilderWebview'
import { projectsState } from '../../../states/projectsState'
import { schemaManagerClient } from '../schemaManagerClient'

export class BuilderSchemaPublisher {
  async publish(schema: BuilderSchema, projectId: string): Promise<SchemaDto> {
    const {
      apiKey: { apiKeyHash },
      wallet: { did },
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } = projectsState.getProjectById(projectId)!

    const scope = schema.isPublic ? 'public' : 'unlisted'
    const [version, revision] = await this.generateNextVersion({
      type: schema.type,
      scope,
      did,
      apiKeyHash,
    })

    const schemaName = this.generateSchemaId({
      namespace: schema.isPublic ? null : did,
      type: schema.type,
      version,
      revision,
    })

    const { jsonSchemaUrl, jsonLdContextUrl } = this.generateSchemaFilesMetadata(
      'https://schema.affinidi.com',
      schemaName,
    )

    const { type } = schema
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
      this.attributesToFields(
        schema.attributes.filter((a) => !a.parentId),
        schema.attributes,
      ),
    )

    return schemaManagerClient.createSchema(
      {
        authorDid: did,
        parentId: null,
        scope,
        type,
        description,
        version,
        revision,
        jsonSchema,
        jsonLdContext,
      },
      { apiKeyHash },
    )
  }

  private attributesToFields(nested: BuilderAttribute[], all: BuilderAttribute[]): SchemaField[] {
    return nested.map<SchemaField>((attribute) => {
      const children = all.filter((a) => a.parentId === attribute.id)
      return {
        name: attribute.name,
        description: attribute.description ?? null,
        type: attribute.type as SchemaFieldType,
        required: attribute.isRequired,
        ...(children.length > 0 && { nested: this.attributesToFields(children, all) }),
      }
    })
  }

  private generateSchemaFilesMetadata(host: string, schemaId: string) {
    const jsonSchemaFilename = `${schemaId}.json`
    const jsonLdContextFilename = `${schemaId}.jsonld`

    return {
      jsonSchemaFilename,
      jsonLdContextFilename,
      jsonSchemaUrl: `${host}/${jsonSchemaFilename}`,
      jsonLdContextUrl: `${host}/${jsonLdContextFilename}`,
    }
  }

  private generateSchemaId(input: {
    namespace: string | null
    type: string
    version: number
    revision: number
  }) {
    const namespacePart = input.namespace ? `@${input.namespace}/` : ''
    return `${namespacePart}${input.type}V${input.version}-${input.revision}`
  }

  private async generateNextVersion(input: {
    type: string
    scope: 'public' | 'unlisted'
    did: string
    apiKeyHash: string
  }) {
    const { schemas } = await schemaManagerClient.searchSchemas(
      {
        did: input.did,
        type: input.type,
        scope: input.scope,
        limit: 1,
      },
      { apiKeyHash: input.apiKeyHash },
    )

    return schemas.length > 0
      ? this.getNextVersion({
          version: schemas[0].version,
          revision: schemas[0].revision,
        })
      : [1, 0]
  }

  private getNextVersion({ version, revision }: { version: number; revision: number }) {
    return revision === 999 ? [version + 1, 0] : [version, revision + 1]
  }
}
