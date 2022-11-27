const NESTED_MARGIN_PX = 20
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

const vscode = acquireVsCodeApi()
window.addEventListener('load', main)

function main() {
  let schema = createEmptySchema()

  function compileSchema() {
    return {
      parentId: null,
      type: document.getElementById('schemaType').value,
      description: document.getElementById('schemaDescription').value,
      isPublic: document.getElementById('isSchemaPublic').checked,
      attributes: schema.attributes.map((attribute) => ({
        id: attribute.id,
        parentId: attribute.parentId,
        name: document.getElementById(`${attribute.id}_name`).value,
        description: document.getElementById(`${attribute.id}_description`).value,
        type: document.getElementById(`${attribute.id}_type`).value,
        isRequired: document.getElementById(`${attribute.id}_isRequired`).checked,
      })),
    }
  }

  function persist() {
    schema = compileSchema()
  }

  function render() {
    renderSchema(schema, {
      onRemoveAttribute: (id) => {
        persist()
        schema.attributes.splice(schema.attributes.findIndex((a) => a.id === id), 1)
        removeInvalidAttributes(schema)
        render()
      },
      onAddAttribute: (parentId) => {
        persist()
        schema.attributes.push(createEmptyAttribute({ parentId }))
        render()
      }
    })
  }

  const form = document.getElementById('schema-builder-form')
  form.addEventListener('submit', (event) => event.preventDefault())
  form.addEventListener('change', () => {
    persist()
    if (removeInvalidAttributes(schema)) {
      render()
    }
  })
  
  const submitButton = document.getElementById('submit-button')
  submitButton.addEventListener('click', () => {
    submitButton.disabled = true;
    vscode.postMessage({ command: 'submit', data: { schema } })
  })

  removeInvalidAttributes(schema)
  render()

  window.addEventListener('message', ({ data: message }) => {
    const { command, data } = message

    if (command === 'init') {
      schema = data && data.schema || createEmptySchema()
      render()
    } else if (command === 'enableSubmit') {
      submitButton.disabled = false;
    }
  })
}

// --- BUSINESS LOGIC

function createEmptySchema() {
  return {
    parentId: null,
    type: '',
    description: '',
    isPublic: false,
    attributes: [createEmptyAttribute()],
  }
}

function createEmptyAttribute({ parentId } = {}) {
  return {
    ...(parentId && { parentId }),
    id: generateId(),
    name: '',
    description: '',
    type: 'Text',
    isRequired: false,
  }
}

/** Returns `true` if the schema has been updated */
function removeInvalidAttributes(schema) {
  // we should remove children from attributes that are not objects
  const nonNestedAttributesWithChildren = schema.attributes.filter(
    (a) => a.type !== 'object' && schema.attributes.some((b) => b.parentId === a.id),
  )

  // we should remove attributes which no longer have valid parents
  const attributeIdsWithInvalidParents = schema.attributes
    .filter((a) => a.parentId && !schema.attributes.some((b) => a.parentId === b.id))
    .map((a) => a.id)

  if (nonNestedAttributesWithChildren.length === 0 && attributeIdsWithInvalidParents.length === 0) {
    return false
  }

  for (const attribute of nonNestedAttributesWithChildren) {
    schema.attributes = schema.attributes.filter((a) => a.parentId !== attribute.id)
  }

  schema.attributes = schema.attributes.filter(
    (a) => !attributeIdsWithInvalidParents.includes(a.id),
  )

  removeInvalidAttributes(schema) // repeat until everything is fixed

  return true
}

// --- RENDERING

function renderSchema(schema, { onRemoveAttribute, onAddAttribute }) {
  const typeInput = document.getElementById('schemaType')
  const descriptionInput = document.getElementById('schemaDescription')
  const isPublicCheckbox = document.getElementById('isSchemaPublic')
  const attributesSection = document.getElementById('schemaAttributes')

  typeInput.value = schema.type
  descriptionInput.value = schema.description
  isPublicCheckbox.checked = schema.isPublic

  function renderAttributes(parentId = undefined, level = 0) {
    const parent = parentId && schema.attributes.find(a => a.id === parentId)
    const attributes = schema.attributes.filter((a) => a.parentId === parentId)

    for (const attribute of attributes) {
      attributesSection.appendChild(createAttributeElement(attribute, level))
      renderAttributes(attribute.id, level + 1)
    }

    const actionsSection = createElement(`
      <section class="wrapper">
        <div class="box-row">
          <vscode-button
            appearance="secondary"
            class="add-attribute-button"
            data-parent-id="${parentId || ''}"
            style="margin-left: ${level * NESTED_MARGIN_PX}px;"
          >Add attribute</vscode-button>
        </div>
      </section>
    `)
    attributesSection.appendChild(actionsSection)

    if (parent) {
      const parentNameInput = document.getElementById(`${parent.id}_name`)
      const parentTypeSelect = document.getElementById(`${parent.id}_type`)

      parentNameInput.addEventListener('change', update)
      parentTypeSelect.addEventListener('change', update)

      const addAttributeButton = actionsSection.querySelector('.add-attribute-button')
      function update() {
        if (parentTypeSelect.value === 'object') {
          actionsSection.style.display = ''
          addAttributeButton.innerText = parentNameInput.value
            ? `Add nested attribute to "${parentNameInput.value}"`
            : 'Add nested attribute'
        } else {
          actionsSection.style.display = 'none'
        }
      }

      update()
    }
  }

  attributesSection.innerHTML = ''
  renderAttributes()

  for (const button of document.querySelectorAll('.remove-attribute-button')) {
    button.addEventListener('click', () => onRemoveAttribute(button.dataset.id))
  }

  for (const button of document.querySelectorAll('.add-attribute-button')) {
    button.addEventListener('click', () => onAddAttribute(button.dataset.parentId))
  }  
}

function createAttributeElement(attribute, level) {
  const id = attribute.id
  const isNested = level > 0

  const attributeElement = createElement(`
    <section class="wrapper" style="margin-left: ${level * NESTED_MARGIN_PX}px;"> 
      <div class="box-row">
        <div class="box" style="width: calc(250px - ${level * NESTED_MARGIN_PX}px);">
          <label>${isNested ? 'Nested attribute name' : 'Attribute name'}</label>
          <vscode-text-field size="40" id="${id}_name"></vscode-text-field>
        </div>

        <div class="box" style="width: 250px;">
          <label>Description (optional)</label>
          <vscode-text-field size="40" id="${id}_description"></vscode-text-field>
        </div>
        
        <div class="box" style="width: 150px;">
          <label>Type</label>
          <vscode-dropdown id="${id}_type">
            ${ATTRIBUTE_TYPE_OPTIONS.map(
              (option) => `<vscode-option value="${option.type}">${option.label}</vscode-option>`,
            ).join('')}
          </vscode-dropdown>
        </div>

        <div class="box">
          <label>Options</label>
          <div class="box-row">
            <vscode-checkbox id="${id}_isRequired">Required</vscode-checkbox>
            <vscode-button appearance="secondary" class="remove-attribute-button" data-id="${id}">Remove</vscode-button>
          </div>
        </div>
      </div>
    </section>
  `)

  const nameInput = attributeElement.querySelector(`#${id}_name`)
  const descriptionInput = attributeElement.querySelector(`#${id}_description`)
  const typeSelect = attributeElement.querySelector(`#${id}_type`)
  const isRequiredCheckbox = attributeElement.querySelector(`#${id}_isRequired`)

  nameInput.value = attribute.name
  descriptionInput.value = attribute.description
  typeSelect.value = attribute.type
  isRequiredCheckbox.checked = attribute.isRequired

  return attributeElement
}

// --- UTILS

function createElement(html) {
  const element = document.createElement('stub')
  element.innerHTML = html
  return element.children[0]
}

let sequenceId = 0
function generateId() {
  sequenceId++
  return `id_${sequenceId}_${Date.now()}`
}
