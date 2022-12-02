import {  l10n } from 'vscode'
import { Schema } from '../../utils/types'
import { showQuickPick } from '../../utils/showQuickPick'
import { schemaManagerState } from './schemaManagerState'

export const EXAMPLE_SCHEMA: Schema = {
  type: 'MySchema',
  jsonLdContextUrl: 'https://schema.affinidi.com/MySchemaV1-0.jsonld',
  jsonSchemaUrl: 'https://schema.affinidi.com/MySchemaV1-0.json',
}

async function askForAuthoredSchema(
  input: {
    projectId: string
    includeExample?: boolean
  },
): Promise<Schema | undefined> {
  const schemas = await schemaManagerState.listAuthoredSchemas(input)
  const pickOptions = schemas.map<[string, Schema]>((schema) => [schema.id, schema])

  if (input.includeExample) {
    if (schemas.length === 0) {
      return EXAMPLE_SCHEMA
    }

    pickOptions.unshift([l10n.t('Use an example schema'), EXAMPLE_SCHEMA])
  }

  return showQuickPick(pickOptions, { title: l10n.t('Select a VC Schema') })
}

async function fetchSchemaUrl(projectId: string) {
  const schema = await askForAuthoredSchema({ includeExample: true, projectId })
  if (!schema) {
    return undefined
  }

  return schema.jsonSchemaUrl
}

function getSchemaName(schema: { type: string; version: number; revision: number }) {
  return `${schema.type}V${schema.version}-${schema.revision}`
}

export const schemaManagerHelpers = {
  askForAuthoredSchema,
  fetchSchemaUrl,
  getSchemaName,
}
