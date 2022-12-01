import { SchemaDto } from '@affinidi/client-schema-manager'

import { ext } from '../extensionVariables'

const STORAGE_KEY = 'schemas'

const getSchemas = (): SchemaDto[] | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const getSchemaById = (id?: string): SchemaDto | undefined => {
  const schemas = getSchemas()
  const selectedSchema = schemas?.find((schema) => schema?.id === id)

  return selectedSchema
}

const setSchemas = (newSchemas: SchemaDto[]) => {
  const schemas = getSchemas() || []

  ext.context.globalState.update(STORAGE_KEY, [...schemas, ...newSchemas])
}

const clear = () => {
  ext.context.globalState.update(STORAGE_KEY, undefined)
}

export const schemasState = {
  setSchemas,
  getSchemas,
  getSchemaById,
  clear,
}
