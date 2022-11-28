import { Schema } from 'jsonschema'

export type JsonSchema = Schema

export type VcJsonSchemaType = {
  $schema: string
  $id?: string
  $metadata?: {
    version: number
    revision: number
    discoverable: boolean
    uris: {
      jsonLdContext: string
      jsonSchema: string
    }
  }
  title?: string
  description?: string
  type: 'object'
  properties: {
    '@context': Schema
    id: Schema
    type: Schema
    issuer: Schema
    credentialSubject: {
      type: 'object'
      properties?: {
        [name: string]: Schema
      }
      required?: string[]
    }
    credentialSchema: {
      type: 'object'
      required: ['id', 'type']
      properties: {
        id: { type: 'string'; format: 'uri' }
        type: { type: 'string' }
      }
    }
    issuanceDate: { type: 'string'; format: 'date-time' }
    expirationDate: { type: 'string'; format: 'date-time' }
  }
  required: string[]
}
