export interface Schema {
  type: string
  jsonLdContextUrl: string
  jsonSchemaUrl: string
}

export type Environment = 'prod' | 'staging' | 'dev'

export type UseCasesAppTypes = 'portable-reputation' | 'certification-and-verification'
