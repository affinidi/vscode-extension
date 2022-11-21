import { SchemaDto } from '@affinidi/client-schema-manager'
import { l10n } from 'vscode'

import { ext } from '../extensionVariables'

const STORAGE_KEY = 'schemas'

const getSchemas = (): SchemaDto[] | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const getSchemaById = (id?: string) => {
  if (!id) {
    throw new Error(l10n.t('Schema ID is not provided'))
  }

  const schemas = getSchemas()
  const selectedSchema = schemas?.find((schema) => schema?.id === id)

  if (!selectedSchema) {
    throw new Error(l10n.t('Schema does not exist.'))
  }

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
