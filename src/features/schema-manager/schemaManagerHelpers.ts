import { window, ProgressLocation, l10n } from 'vscode'
import { Options, SchemaSearchScope } from '@affinidi/client-schema-manager'
import { Schema } from '../../shared/types'
import { showQuickPick } from '../../utils/showQuickPick'
import { iamHelpers } from '../iam/iamHelpers'
import { schemasState } from '../../states/schemasState'
import { schemaManagerClient } from './schemaManagerClient'

export const EXAMPLE_SCHEMA: Schema = {
  type: 'MySchema',
  jsonLdContextUrl: 'https://schema.affinidi.com/MySchemaV1-0.jsonld',
  jsonSchemaUrl: 'https://schema.affinidi.com/MySchemaV1-0.json',
}

const getMySchemas = async (
  input: {
    did: string
    scope?: SchemaSearchScope
  },
  options: Options,
) => {
  let schemas = schemasState.getSchemas()?.filter((schema) => {
    if (input.scope === 'public') {
      return schema.namespace === null
    }

    if (input.scope === 'unlisted') {
      return !!schema.namespace
    }

    return schema
  })

  if (!schemas?.length) {
    const result = await schemaManagerClient.searchSchemas(
      {
        did: input.did,
        authorDid: input.did,
        scope: input.scope ?? 'default',
      },
      options,
    )

    schemas = result.schemas

    schemasState.setSchemas(schemas)
  }

  return schemas
}

async function askForMySchema(
  input: {
    includeExample?: boolean
    did: string
  },
  options: Options,
): Promise<Schema | undefined> {
  const schemas = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Fetching available schemas...'),
    },
    () => getMySchemas(input, options),
  )

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
  const {
    apiKey: { apiKeyHash },
    wallet: { did },
  } = iamHelpers.requireProjectSummary(projectId)

  const schema = await askForMySchema({ includeExample: true, did }, { apiKeyHash })
  if (!schema) {
    return undefined
  }

  return schema.jsonSchemaUrl
}

function getSchemaName(schema: { type: string; version: number; revision: number }) {
  return `${schema.type}V${schema.version}-${schema.revision}`
}

export const schemaManagerHelpers = {
  askForMySchema,
  fetchSchemaUrl,
  getSchemaName,
  getMySchemas,
}
