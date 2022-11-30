const FORM_SELECTOR = '.schema'
const SUBMIT_BUTTON_SELECTOR = '.schema__submit-button'
const SCHEMA_TYPE_SELECTOR = '.schema__type'
const SCHEMA_DESCRIPTION_SELECTOR = '.schema__description'
const SCHEMA_IS_PUBLIC_SELECTOR = '.schema__is-public'
const SCHEMA_ATTRIBUTES_SELECTOR = '.schema__attributes'
const ATTRIBUTE_NAME_SELECTOR = '.attribute__name'
const ATTRIBUTE_DESCRIPTION_SELECTOR = '.attribute__description'
const ATTRIBUTE_TYPE_SELECTOR = '.attribute__type'
const ATTRIBUTE_IS_REQUIRED_SELECTOR = '.attribute__is-required'
const ADD_ATTRIBUTE_BUTTON_SELECTOR = '.add-attribute-button'
const REMOVE_ATTRIBUTE_BUTTON_SELECTOR = '.remove-attribute-button'

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
      type: document.querySelector(SCHEMA_TYPE_SELECTOR).value,
      description: document.querySelector(SCHEMA_DESCRIPTION_SELECTOR).value,
      isPublic: document.querySelector(SCHEMA_IS_PUBLIC_SELECTOR).checked,
      attributes: schema.attributes.map((attribute) => {
        const element = document.getElementById(attribute.id)
        if (!element) return attribute

        return {
          id: attribute.id,
          parentId: attribute.parentId,
          name: element.querySelector(ATTRIBUTE_NAME_SELECTOR).value,
          description: element.querySelector(ATTRIBUTE_DESCRIPTION_SELECTOR).value,
          type: element.querySelector(ATTRIBUTE_TYPE_SELECTOR).value,
          isRequired: element.querySelector(ATTRIBUTE_IS_REQUIRED_SELECTOR).checked,
        }
      }),
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

  const form = document.querySelector(FORM_SELECTOR)
  form.addEventListener('submit', (event) => event.preventDefault())
  form.addEventListener('change', () => {
    persist()
    if (removeInvalidAttributes(schema)) {
      render()
    }
  })
  
  const submitButton = document.querySelector(SUBMIT_BUTTON_SELECTOR)
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
    } else if (command === 'setScope') {
      document.querySelector(SCHEMA_IS_PUBLIC_SELECTOR).checked = data.scope === 'public'
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
    id: generateAttributeId(),
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
  const typeInput = document.querySelector(SCHEMA_TYPE_SELECTOR)
  const descriptionInput = document.querySelector(SCHEMA_DESCRIPTION_SELECTOR)
  const isPublicCheckbox = document.querySelector(SCHEMA_IS_PUBLIC_SELECTOR)
  const attributesSection = document.querySelector(SCHEMA_ATTRIBUTES_SELECTOR)

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
      const parentAttribute = document.getElementById(parent.id)
      const parentNameInput = parentAttribute.querySelector(ATTRIBUTE_NAME_SELECTOR)
      const parentTypeSelect = parentAttribute.querySelector(ATTRIBUTE_TYPE_SELECTOR)

      parentNameInput.addEventListener('change', update)
      parentTypeSelect.addEventListener('change', update)

      const addAttributeButton = actionsSection.querySelector(ADD_ATTRIBUTE_BUTTON_SELECTOR)
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

  for (const button of document.querySelectorAll(REMOVE_ATTRIBUTE_BUTTON_SELECTOR)) {
    button.addEventListener('click', () => onRemoveAttribute(button.dataset.id))
  }

  for (const button of document.querySelectorAll(ADD_ATTRIBUTE_BUTTON_SELECTOR)) {
    button.addEventListener('click', () => onAddAttribute(button.dataset.parentId))
  }  
}

function createAttributeElement(attribute, level) {
  const isNested = level > 0

  const attributeElement = createElement(`
    <section class="wrapper" style="margin-left: ${level * NESTED_MARGIN_PX}px;" id="${attribute.id}"> 
      <div class="box-row">
        <div class="box" style="width: calc(250px - ${level * NESTED_MARGIN_PX}px);">
          <label>${isNested ? 'Nested&nbsp;attribute&nbsp;name' : 'Attribute&nbsp;name'}</label>
          <vscode-text-field size="40" class="attribute__name"></vscode-text-field>
        </div>

        <div class="box" style="width: 250px;">
          <label>Description&nbsp;(optional)</label>
          <vscode-text-field size="40" class="attribute__description"></vscode-text-field>
        </div>
        
        <div class="box" style="width: 150px;">
          <label>Type</label>
          <vscode-dropdown class="attribute__type">
            ${ATTRIBUTE_TYPE_OPTIONS.map(
              (option) => `<vscode-option value="${option.type}">${option.label}</vscode-option>`,
            ).join('')}
          </vscode-dropdown>
        </div>

        <div class="box">
          <label>Options</label>
          <div class="box-row">
            <vscode-checkbox class="attribute__is-required">Required</vscode-checkbox>
            <vscode-button appearance="secondary" class="remove-attribute-button" data-id="${attribute.id}">Remove</vscode-button>
          </div>
        </div>
      </div>
    </section>
  `)

  const nameInput = attributeElement.querySelector(ATTRIBUTE_NAME_SELECTOR)
  const descriptionInput = attributeElement.querySelector(ATTRIBUTE_DESCRIPTION_SELECTOR)
  const typeSelect = attributeElement.querySelector(ATTRIBUTE_TYPE_SELECTOR)
  const isRequiredCheckbox = attributeElement.querySelector(ATTRIBUTE_IS_REQUIRED_SELECTOR)

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
function generateAttributeId() {
  sequenceId++
  return `attribute_${sequenceId}_${Date.now()}`
}
