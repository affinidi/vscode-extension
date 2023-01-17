import fetch from 'node-fetch'
import { validate } from 'jsonschema'
import { JsonSchema } from './json-schema.dto'
import { DRAFT_07_SCHEMA, DRAFT_07_URL } from './json-schema-draft-07.schema'
import { parseJsonSchemaUrl } from '../../../utils/parseJsonSchemaUrl'
import { VcJsonSchemaFetcher } from './vc-json-schema-fetcher'

export class JsonSchemaFetcher {
  constructor(
    private readonly allowedDomains: string[],
    private readonly pFetch: typeof fetch = fetch,
  ) {}

  async fetch(url: URL): Promise<JsonSchema> {
    this.assertURLisSafe(url)

    const endpoint = `${url.protocol}//${url.hostname}${url.pathname}`
    const response = await this.pFetch(endpoint, { method: 'GET' })

    const { status: statusCode } = response

    if (statusCode !== 200) {
      throw new Error(`unexpected status code when fetching '${endpoint}': ${statusCode}`)
    }

    const jsonSchema = await response.json()

    JsonSchemaFetcher.assertJsonSchema(jsonSchema)

    return jsonSchema
  }

  private static assertJsonSchema(jsonSchema: {
    $schema?: string
    $id?: string
  }): asserts jsonSchema is JsonSchema {
    const schemaUrl = parseJsonSchemaUrl(jsonSchema.$schema ?? '')

    if (
      schemaUrl.hostname !== DRAFT_07_URL.hostname ||
      schemaUrl.pathname !== DRAFT_07_URL.pathname
    ) {
      throw new Error(`schema '${jsonSchema.$id}' did not have draft 07 url`)
    }

    const validationResult = validate(jsonSchema, DRAFT_07_SCHEMA)

    if (!validationResult.valid) {
      throw new Error(`schema '${jsonSchema.$id}' was not valid against draft 07 schema`)
    }
  }

  private assertURLisSafe(url: URL) {
    if (
      !this.allowedDomains.some((affinidiDomain) => url.hostname.endsWith(affinidiDomain)) ||
      !url.pathname.endsWith('.json')
    ) {
      throw new Error(`Invalid/unsafe URL: ${url}`)
    }
  }
}

export const vcJsonSchemaFetcher = new VcJsonSchemaFetcher(
  new JsonSchemaFetcher(['affinity-project.org', 'affinidi.com', 'affinidi.io'], fetch),
)
