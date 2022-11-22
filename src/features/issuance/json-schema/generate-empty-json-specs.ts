import { JsonSchema } from './json-schema.dto'
import { VcJsonSchema } from './vc-json-schema'

function assertUnreachableVerificationMethod(val: never): never {
  throw new Error(`unexpected verification method: '${val}'`)
}

export type EmptyJson = {
  path: string[]
  type: 'string' | 'number' | 'integer' | 'boolean'
  format?: string
  required: boolean
}

export type FileColumns = {
  verificationTargetColumn: EmptyJson
  credentialSubjectColumns: EmptyJson[]
}

type VerificationMethod = 'email'

function jsonSchemaToEmptyJsonColumnSpecs(initial: JsonSchema): EmptyJson[] {
  const CSV_NESTED_OBJ_DELIMITER = '.'
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
        throw new Error(
          `type '${schema.type}' not supported for CSV path at path: '${[
            'credentialSubject',
            ...path,
          ].join(CSV_NESTED_OBJ_DELIMITER)}'`,
        )
    }
  }

  return columns
}

function offerVerificationMethodToJsonColumnSpec(method: VerificationMethod): EmptyJson {
  switch (method) {
    case 'email':
      return { path: ['@target', 'email'], type: 'string', format: 'email', required: true }
    default:
      return assertUnreachableVerificationMethod(method)
  }
}

export function generateEmptyJsonColumnSpecs(
  offerVerificationMethod: VerificationMethod,
  schema: VcJsonSchema,
): FileColumns {
  return {
    verificationTargetColumn: offerVerificationMethodToJsonColumnSpec(offerVerificationMethod),
    credentialSubjectColumns: jsonSchemaToEmptyJsonColumnSpecs(schema.getCredentialSubjectSchema()),
  }
}
