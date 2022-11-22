import fetch from 'node-fetch'
import { parseJsonSchemaUrl } from '../../../shared/parse-json-schema-url'
import { generateColumnSpecs } from './generate-empty-json-specs'
import { JsonSchemaFetcher } from './json-schema-fetcher'
import { VcJsonSchemaFetcher } from './vc-json-schema-fetcher'

const vcJsonSchemaFetcher = new VcJsonSchemaFetcher(
  new JsonSchemaFetcher(['affinity-project.org', 'affinidi.com'], fetch),
)
// create nested structure with the specified path
function createNestedTarget(object, path) {
  let target = object
  for (const field of path) {
    if (target[field] === undefined) {
      target[field] = {}
    }

    target = target[field]
  }

  return target
}

function columnsToObject(columns) {
  const result = {}

  for (const column of columns) {
    const field = column.path[column.path.length - 1]
    const target = createNestedTarget(result, column.path.slice(0, -1))

    target[field] = 'empty'
  }

  return result
}

export async function generateSampleFromJsonSchema(jsonSchemaUrl: string) {
  const jsonSchemaURL = parseJsonSchemaUrl(jsonSchemaUrl)
  const vcJsonSchema = await vcJsonSchemaFetcher.fetch(jsonSchemaURL)

  const columnSpecs = generateColumnSpecs(vcJsonSchema)
  const sample = columnsToObject(columnSpecs)
  return sample
}
