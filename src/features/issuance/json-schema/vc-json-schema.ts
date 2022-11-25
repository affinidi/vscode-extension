import { JsonSchema, VcJsonSchemaType } from './json-schema.dto'

export class VcJsonSchema {
  constructor(private readonly schema: VcJsonSchemaType) {}

  getCredentialSubjectSchema(): JsonSchema {
    return this.schema.properties.credentialSubject
  }
}
