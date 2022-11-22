import { nanoid } from 'nanoid'
import { Webview, Uri, ViewColumn, WebviewPanel, window } from 'vscode'
import { ext } from '../../../extensionVariables'
import { getUri } from '../../../ui/getUri'

type AttributeType = 'did' | 'Text' | 'URL' | 'Date' | 'DateTime' | 'Number' | 'Boolean' | 'object'
type Attribute = {
  id: string
  name: string
  description: string
  type: AttributeType
  children: Attribute[]
}

const ATTRIBUTE_TYPE_OPTIONS: { type: AttributeType; label: string }[] = [
  { type: 'did', label: 'DID' },
  { type: 'Text', label: 'Text' },
  { type: 'URL', label: 'URL' },
  { type: 'Date', label: 'Date' },
  { type: 'DateTime', label: 'DateTime' },
  { type: 'Number', label: 'Number' },
  { type: 'Boolean', label: 'Boolean' },
  { type: 'object', label: 'nest attributes' },
]

function renderAttribute(attribute: Attribute) {
  return /* html */ `
  <section class="wrapper"> 
    <div class="box-row">
      <div class="box">
        <label>Attribute name</label>
        <vscode-text-field placeholder="Enter attribute name" size="40" value="${
          attribute.name
        }" name="${attribute.id}_name"></vscode-text-field>
      </div>

      <div class="box">
        <label>Description</label>
        <vscode-text-field placeholder="Enter attribute description" size="40" value="${
          attribute.description
        }" name="${attribute.id}_description"></vscode-text-field>
      </div>
      
      <div class="box">
        <label>Type</label>
        <vscode-dropdown name="${attribute.id}_type">
          ${ATTRIBUTE_TYPE_OPTIONS.map(
            (option) => `<vscode-option value="${option.type}">${option.label}</vscode-option>`,
          ).join('')}
        </vscode-dropdown>
      </div>

      <div class="box">
        <label>Options</label>
        <vscode-checkbox name="${attribute.id}_isRequired">Required</vscode-checkbox>
      </div>
    </div>
  </section>
`
}

export function getCreateSchemaViewContent(
  webview: Webview,
  extensionUri: Uri,
  attributes: Attribute[],
) {
  const toolkitUri = getUri(webview, extensionUri, [
    'node_modules',
    '@vscode',
    'webview-ui-toolkit',
    'dist',
    'toolkit.js',
  ])
  const styleUri = getUri(webview, extensionUri, ['media', 'style.css'])

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <link rel="stylesheet" href="${styleUri}">
        <title>create schema</title>
    </head>

    <body>
      <form id="form">
        <section class="wrapper">
          <div class="box-row">
            <div class="box">
              <vscode-text-field placeholder="Enter schema type" size="40" name="schemaType">Schema type</vscode-text-field>
                <div class="box-row">
                  <vscode-text-field placeholder="1" name="schemaVersion">Version</vscode-text-field>
                  <vscode-text-field placeholder="0" name="schemaRevision">Revision</vscode-text-field>
                </div>
            </div>
            <div class="box">
              <vscode-text-area placeholder="Enter description" rows="4" cols="50" name="schemaDescription">Description</vscode-text-area>
            </div>
          </div> 
          <div class="box-row">
            <vscode-checkbox name="isSchemaPublic">Make this schema public</vscode-checkbox>
          </div>
        </section>

        ${attributes.map((attribute) => renderAttribute(attribute)).join('\n')}

        <vscode-button id="add-attribute">Add Attribute</vscode-button>

        <section> 
          <vscode-button id="create-schema">Publish the schema</vscode-button>
        </section>
      </form>
      <script> 
        window.addEventListener('load', () => {
          const vscode = acquireVsCodeApi()
          
          const addAttributeButton = document.getElementById('add-attribute')
          addAttributeButton.addEventListener('click', () => {
            vscode.postMessage({ command: 'addAttribute' })
          })

          const form = document.getElementById('form')
          form.addEventListener('change', () => {
            console.log(form)
            vscode.postMessage({ command: 'update', form: form.data })
          })
        })
      </script>
    </body>
  </html>
`
}

export function createSchema() {
  let schemaBuilderPanel: WebviewPanel | undefined
  if (!schemaBuilderPanel) {
    schemaBuilderPanel = window.createWebviewPanel(
      'schemaBuilderView',
      'Create Schema',
      ViewColumn.One,
      {
        enableScripts: true,
      },
    )
  }

  const attributes: Attribute[] = []

  schemaBuilderPanel.webview.html = getCreateSchemaViewContent(
    schemaBuilderPanel.webview,
    ext.context.extensionUri,
    attributes,
  )

  schemaBuilderPanel.webview.onDidReceiveMessage(
    (message) => {
      if (schemaBuilderPanel && message.command === 'addAttribute') {
        attributes.push({
          id: nanoid(),
          name: 'helloWorld',
          description: 'hello world',
          type: 'Text',
          children: [
            {
              id: nanoid(),
              name: 'helloWorld',
              description: 'hello world',
              type: 'Text',
              children: [],
            },
          ],
        })

        schemaBuilderPanel.webview.html = getCreateSchemaViewContent(
          schemaBuilderPanel.webview,
          ext.context.extensionUri,
          attributes,
        )
      }

      if (schemaBuilderPanel && message.command === 'update') {
        console.log('update', message)
      }
    },
    undefined,
    ext.context.subscriptions,
  )

  schemaBuilderPanel?.onDidDispose(
    () => {
      // When the panel is closed, cancel any future updates to the webview content
      schemaBuilderPanel = undefined
    },
    null,
    ext.context.subscriptions,
  )
}
