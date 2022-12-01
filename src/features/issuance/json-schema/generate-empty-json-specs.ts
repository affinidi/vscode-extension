import { JsonSchema } from './json-schema.dto'
import { VcJsonSchema } from './vc-json-schema'

export type ColumnSpec = {
  path: string[]
  type: 'string' | 'number' | 'integer' | 'boolean' | 'unknown'
  format?: string
  required: boolean
}

function columnsToObject(initial: JsonSchema): ColumnSpec[] {
  const columns: ColumnSpec[] = []
  const work: { schema: JsonSchema; path: string[]; requiredFromParent: boolean }[] = [
    { schema: initial, path: [], requiredFromParent: false },
  ]
  // TODO: add limitation on how long this for loop can go. maybe open to ddos.
  while (work.length > 0) {
    const { schema, path, requiredFromParent } = work.shift()!

    switch (schema.type) {
      case 'object':
        Object.entries(schema.properties ?? {}).forEach(([key, value]) => {
          work.push({
            schema: value,
            path: [...path, key],
            requiredFromParent: Array.isArray(schema.required) && schema.required.includes(key),
          })
        })
        break
      case 'string':
      case 'number':
      case 'integer':
      case 'boolean':
        columns.push({
          path,
          type: schema.type,
          format: schema.format,
          required: requiredFromParent || schema.required === true,
        })
        break
      default:
        columns.push({
          path,
          type: 'unknown',
          required: requiredFromParent || schema.required === true,
        })
        break
    }
  }

  return columns
}

export function generateColumnSpecs(schema: VcJsonSchema): ColumnSpec[] {
  return columnsToObject(schema.getCredentialSubjectSchema())
}
