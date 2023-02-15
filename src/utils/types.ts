export interface Schema {
  type: string
  jsonLdContextUrl: string
  jsonSchemaUrl: string
}

export type Environment = 'prod' | 'staging' | 'dev'

export type UseCasesAppTypes = 'education' | 'health' | 'portable-reputation' | 'ticketing'
