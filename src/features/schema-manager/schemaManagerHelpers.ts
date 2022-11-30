import { window, ProgressLocation } from 'vscode'
import { Options } from '@affinidi/client-schema-manager'
import { getMySchemas } from './getMySchemas'
import { Schema } from '../../shared/types'
import { showQuickPick } from '../../utils/showQuickPick'
import { iamHelpers } from '../iam/iamHelpers'
import { schemaMessage } from '../../messages/messages'

export const EXAMPLE_SCHEMA: Schema = {
  type: 'MySchema',
  jsonLdContextUrl: 'https://schema.affinidi.com/MySchemaV1-0.jsonld',
  jsonSchemaUrl: 'https://schema.affinidi.com/MySchemaV1-0.json',
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
      title: `${schemaMessage.fetchSchemas}`,
    },
    () => getMySchemas(input, options),
  )

  const pickOptions = schemas.map<[string, Schema]>((schema) => [schema.id, schema])

  if (input.includeExample) {
    if (schemas.length === 0) {
      return EXAMPLE_SCHEMA
    }

    pickOptions.unshift([`${schemaMessage.exampleSchema}`, EXAMPLE_SCHEMA])
  }

  return showQuickPick(pickOptions, { title: `${schemaMessage.selectSchema}` })
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

export const schemaManagerHelpers = {
  askForMySchema,
  fetchSchemaUrl,
}
