export interface Schema {
  type: string
  jsonLdContextUrl: string
  jsonSchemaUrl: string
}

export type Environment = 'prod' | 'staging' | 'dev'

export type UseCasesAppTypes = 'career' | 'education' | 'gaming' | 'health' | 'ticketing'
