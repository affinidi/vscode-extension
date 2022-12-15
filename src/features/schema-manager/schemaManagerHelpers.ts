import nodeFetch from 'node-fetch'
import * as path from 'path'
import { window, ProgressLocation } from 'vscode'
import { Schema } from '../../utils/types'
import { showQuickPick } from '../../utils/showQuickPick'
import { schemaMessage } from '../../messages/messages'
import { schemaManagerState } from './schemaManagerState'
import { readOnlyContentViewer } from '../../utils/openReadOnlyContent'
import { SchemaDto } from '@affinidi/client-schema-manager'

export const EXAMPLE_SCHEMA: Schema = {
  type: 'MySchema',
  jsonLdContextUrl: 'https://schema.affinidi.com/MySchemaV1-0.jsonld',
  jsonSchemaUrl: 'https://schema.affinidi.com/MySchemaV1-0.json',
}

async function askForAuthoredSchema(input: {
  projectId: string
  includeExample?: boolean
}): Promise<Schema | undefined> {
  const schemas = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: schemaMessage.fetchingSchemas,
    },
    () => schemaManagerState.listAuthoredSchemas(input),
  )

  const pickOptions = schemas.map<[string, Schema]>((schema) => [schema.id, schema])

  if (input.includeExample) {
    if (schemas.length === 0) {
      return EXAMPLE_SCHEMA
    }

    pickOptions.unshift([schemaMessage.exampleSchema, EXAMPLE_SCHEMA])
  }

  return showQuickPick(pickOptions, { title: schemaMessage.selectSchema })
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

const showSchemaFile = async (
  schema: SchemaDto,
  file: 'json' | 'jsonld',
  fetch = nodeFetch,
) => {
  return window.withProgress(
    { location: ProgressLocation.Notification, title: schemaMessage.loadingSchemaContent },
    async () => {
      const url = file === 'json' ? schema.jsonSchemaUrl : schema.jsonLdContextUrl

      const fetchedData = await fetch(url)
      const schemaContent = await fetchedData.json()

      await readOnlyContentViewer.open({
        node: { label: schemaManagerHelpers.getSchemaName(schema), id: schema.id },
        content: schemaContent,
        fileExtension: path.extname(url),
      })
    },
  )
}

export const schemaManagerHelpers = {
  showSchemaFile,
  askForAuthoredSchema,
  fetchSchemaUrl,
  getSchemaName,
}
