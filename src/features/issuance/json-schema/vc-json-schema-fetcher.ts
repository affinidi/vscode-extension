import { validate } from 'jsonschema'
import { JsonSchemaFetcher } from './json-schema-fetcher'
import { JsonSchema, VcJsonSchemaType } from './json-schema.dto'
import { VC_JSON_SCHEMA } from './vc-json-schema.schema'
import { VcJsonSchema } from './vc-json-schema'

export class VcJsonSchemaFetcher {
  constructor(private readonly jsonSchemaFetcher: JsonSchemaFetcher) {}

  async fetch(url: URL): Promise<VcJsonSchema> {
    const schema = await this.jsonSchemaFetcher.fetch(url)

    VcJsonSchemaFetcher.assertVcJsonSchema(schema)

    return new VcJsonSchema(schema)
  }

  private static assertVcJsonSchema(
    jsonSchema: JsonSchema,
  ): asserts jsonSchema is VcJsonSchemaType {
    const validationResult = validate(jsonSchema, VC_JSON_SCHEMA)

    if (!validationResult.valid) {
      throw new Error(`schema '${jsonSchema.$id}' was not valid against vc json schema`)
    }
  }
}
