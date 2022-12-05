import { JsonSchema, VcJsonSchemaType } from './json-schema.dto'

export class VcJsonSchema {
  constructor(private readonly schema: VcJsonSchemaType) {}

  getContent(): any {
    return this.schema
  }

  getCredentialSubjectSchema(): JsonSchema {
    return this.schema.properties.credentialSubject
  }
}
