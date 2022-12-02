import type { SchemaField } from '@affinidi/affinidi-vc-schemas'
import { nanoid } from 'nanoid'
import type { BuilderAttribute } from '../SchemaBuilderWebview'

export function parseSchemaFields(fields: SchemaField[], parentId?: string): BuilderAttribute[] {
  return fields.flatMap((field) => {
    const id = nanoid()
    return [
      {
        id,
        parentId,
        name: field.name,
        description: field.description ?? '',
        type: field.type,
        isRequired: field.required,
      },
      ...parseSchemaFields(field.nested ?? [], id),
    ]
  })
}
