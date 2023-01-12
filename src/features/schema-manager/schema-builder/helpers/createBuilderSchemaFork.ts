import { SchemaField, parseSchema } from '@affinidi/affinidi-vc-schemas';
import { nanoid } from 'nanoid';
import { window, ProgressLocation } from 'vscode';
import { schemaMessage } from '../../messages';
import { vcJsonSchemaFetcher } from '../../../issuance/json-schema/json-schema-fetcher';
import { schemaManagerState } from '../../schemaManagerState';
import { BuilderAttribute } from '../SchemaBuilderWebview';

function fieldsToAttributes(fields: SchemaField[], parentId?: string): BuilderAttribute[] {
  return fields.flatMap((field) => {
    const id = nanoid()
    return [
      {
        id,
        parentId,
        name: field.name,
        description: field.description ?? '',
        isRequired: field.required,
        type: field.type,
      },
      ...fieldsToAttributes(field.nested ?? [], id),
    ]
  })
}

export async function createBuilderSchemaFork(input: { projectId: string; schemaId: string }) {
  return await window.withProgress(
    { location: ProgressLocation.Notification, title: schemaMessage.loadingSchemaContent },
    async () => {
      const parentSchema = await schemaManagerState.getAuthoredSchemaById({
        projectId: input.projectId,
        schemaId: input.schemaId,
      })

      if (parentSchema) {
        const jsonSchema = await vcJsonSchemaFetcher.fetch(new URL(parentSchema.jsonSchemaUrl))
        const { fields } = parseSchema(jsonSchema.getContent())

        return {
          parentId: parentSchema.id,
          type: parentSchema.type,
          description: parentSchema.description ?? '',
          isPublic: parentSchema.namespace === null,
          attributes: fieldsToAttributes(fields),
        }
      }

      return undefined
    },
  )
}
