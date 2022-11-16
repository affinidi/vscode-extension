import { window, ProgressLocation, l10n } from 'vscode'
import { Options } from '@affinidi/client-schema-manager'
import { getMySchemas } from './getMySchemas'
import { Schema } from '../../shared/types'
import { showQuickPick } from '../../utils/showQuickPick'

export const EXAMPLE_SCHEMA: Schema = {
  type: 'MySchema',
  jsonLdContextUrl: 'https://schema.affinidi.com/MySchemaV1-0.jsonld',
  jsonSchemaUrl: 'https://schema.affinidi.com/MySchemaV1-0.json',
}

export async function askForMySchema(
  input: {
    includeExample?: boolean
    did: string
  },
  options: Options,
): Promise<Schema | undefined> {
  const { schemas } = await window.withProgress(
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
