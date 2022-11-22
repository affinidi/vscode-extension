import { JsonSchema } from './json-schema.dto'
import { VcJsonSchema } from './vc-json-schema'

export type EmptyJson = {
  path: string[]
  type: 'string' | 'number' | 'integer' | 'boolean'
  format?: string
  required: boolean
}

export type FileColumns = {
  credentialSubjectColumns: EmptyJson[]
}

function columnsToObject(initial: JsonSchema): EmptyJson[] {
  const columns: EmptyJson[] = []
  const work: { schema: JsonSchema; path: string[]; requiredFromParent: boolean }[] = [
    { schema: initial, path: [], requiredFromParent: false },
  ]
  // TODO: add limitation on how long this for loop can go. maybe open to ddos.
  while (work.length > 0) {
    const { schema, path, requiredFromParent } = work.shift()

    switch (schema.type) {
      case 'object':
        Object.entries(schema.properties).forEach(([key, value]) => {
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
    }
  }

  return columns
}

export function generateColumnSpecs(schema: VcJsonSchema): FileColumns {
  return {
    credentialSubjectColumns: columnsToObject(schema.getCredentialSubjectSchema()),
  }
}
