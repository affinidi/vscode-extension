import fetch from 'node-fetch'
import { ProgressLocation, window } from 'vscode'
import { csvMessage } from '../../../messages/messages'
import { parseJsonSchemaUrl } from '../../../utils/parseJsonSchemaUrl'
import { Schema } from '../../../utils/types'
import { ColumnSpec, generateColumnSpecs } from './generate-empty-json-specs'
import { vcJsonSchemaFetcher } from './json-schema-fetcher'

// create nested structure with the specified path
function createNestedTarget(object: any, path: string[]) {
  let target = object
  for (const field of path) {
    if (target[field] === undefined) {
      target[field] = {}
    }

    target = target[field]
  }

  return target
}

function columnTypeToMockValue(type: ColumnSpec['type']) {
  if (type === 'integer' || type === 'number') return 0
  if (type === 'string') return ''
  if (type === 'boolean') return false
  return null
}

export function columnsToObject(columns: ColumnSpec[]) {
  const result = {}

  for (const column of columns) {
    const field = column.path[column.path.length - 1]
    const target = createNestedTarget(result, column.path.slice(0, -1))

    target[field] = columnTypeToMockValue(column.type)
  }

  return result
}

export async function generateCredentialSubjectSample(schema: Schema) {
  return window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: csvMessage.generatingCredentialSubjectSample,
    },
    async () => {
      const parsedJsonSchemaUrl = parseJsonSchemaUrl(schema.jsonSchemaUrl)
      const vcJsonSchema = await vcJsonSchemaFetcher.fetch(parsedJsonSchemaUrl)

      const columnSpecs = generateColumnSpecs(vcJsonSchema)
      return columnsToObject(columnSpecs)
    },
  )
}
