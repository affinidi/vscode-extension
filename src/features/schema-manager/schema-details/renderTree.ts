import { SchemaField, SchemaFieldType } from '@affinidi/affinidi-vc-schemas'

import { schemaMessage } from '../../../messages/messages'

const ATTRIBUTE_TYPE_OPTIONS = [
  { type: 'did', label: 'DID' },
  { type: 'Text', label: 'Text' },
  { type: 'URL', label: 'URL' },
  { type: 'Date', label: 'Date' },
  { type: 'DateTime', label: 'DateTime' },
  { type: 'Number', label: 'Number' },
  { type: 'Boolean', label: 'Boolean' },
  { type: 'object', label: 'Object (nest attributes)' },
]

export const renderTree = (subFields?: SchemaField[], nestedLevel = 0): string | undefined =>
  subFields
    ?.map((field, index) => {
      const selectedOption = ATTRIBUTE_TYPE_OPTIONS.find((option) => option.type === field?.type)
      const hasSibling = !!subFields[index + 1]

      return `
        <div
          class="attribute-box flex-1
            ${nestedLevel === 0 ? 'parent-attribute' : ''}
            ${nestedLevel > 0 ? 'attribute' : ''}
            ${hasSibling ? 'has-sibling' : ''}
            ${nestedLevel > 0 && subFields.length === 1 ? 'no-siblings' : ''}
          "
        >
          <div class="flex flex-1 attribute-details">
            <div class="flex flex-1">${field.name}</div>
            <div class="flex">
              ${
                selectedOption?.type !== SchemaFieldType.Object
                  ? `<div class="attribute-type">${selectedOption?.label}</div>`
                  : ''
              }
              <div class="attribute-required">
                ${field.required ? schemaMessage.yes : schemaMessage.no}
              </div>
            </div>
          </div>
          ${field.nested?.length ? renderTree(field.nested, nestedLevel + 1) : ''}
        </div>
      `
    })
    .join('')
