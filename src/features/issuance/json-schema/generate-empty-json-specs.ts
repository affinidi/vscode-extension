// // import { VcJsonSchema } from './vc-json-schema'
// import { JsonSchema } from './json-schema.dto'

// function assertUnreachableVerificationMethod(val: never): never {
//   throw new Error(`unexpected verification method: '${val}'`)
// }

// export type VerificationMethod = 'email'

// export type EmptyJson = {
//   path: string[]
//   type: 'string' | 'number' | 'integer' | 'boolean'
//   format?: string
//   required: boolean
// }

// export type FileColumns = {
//   verificationTargetColumn: EmptyJson
//   credentialSubjectColumns: EmptyJson[]
// }

// export function columnsToObject(initial: EmptyJson): EmptyJson[] {
//   const columns: EmptyJson[] = []
//   const work: { schema: EmptyJson; path: string[]; requiredFromParent: boolean }[] = [
//     { schema: initial, path: [], requiredFromParent: false },
//   ]

//   // TODO: add limitation on how long this for loop can go. maybe open to ddos.
//   while (work.length > 0) {
//     const { schema, path, requiredFromParent } = work.shift()

//     switch (schema.type) {
//       case 'object':
//         Object.entries(schema.properties).forEach(([key, value]) => {
//           work.push({
//             schema: value,
//             path: [...path, key],
//             requiredFromParent: Array.isArray(schema.required) && schema.required.includes(key),
//           })
//         })
//         break
//       case 'string':
//       case 'number':
//       case 'integer':
//       case 'boolean':
//       case 'unknown':
//         columns.push({
//           path,
//           type: schema.type,
//           format: schema.format,
//           required: requiredFromParent || schema.required === true,
//         })
//         break
//       default:
//     }
//   }

//   return columns
// }

// function offerVerificationMethodColumnsToObjectSpec(method: VerificationMethod): EmptyJson {
//   switch (method) {
//     case 'email':
//       return { path: ['@target', 'email'], type: 'string', format: 'email', required: true }
//     default:
//       return assertUnreachableVerificationMethod(method)
//   }
// }

// export function generateColumnsToObjectSpecs(
//   offerVerificationMethod: VerificationMethod,
//   schema: EmptyJson,
// ): FileColumns {
//   return {
//     verificationTargetColumn: offerVerificationMethodColumnsToObjectSpec(offerVerificationMethod),
//     credentialSubjectColumns: columnsToObject(schema),
//   }
// }

import { JsonSchema } from './json-schema.dto'

export type VerificationMethod = 'email'

export type EmptyJson = {
  path: string[]
  type: 'string' | 'number' | 'integer' | 'boolean'
  format?: string
  required: boolean
}

export function columnsToObject(initial: JsonSchema): EmptyJson[] {
  const work: { schema: JsonSchema; path: string[] }[] = [{ schema: initial, path: [] }]

  // TODO: add limitation on how long this for loop can go. maybe open to ddos.
  while (work.length > 0) {
    const { schema, path } = work.shift()

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

      default:
    }
  }

  return work
}
