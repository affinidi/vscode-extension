// TODO: experiment with frameworks like React
// TODO: build JSON-LD context and JSON schema using vc-schemas library
// TODO: reuse panel
// TODO: refactor & improve readability, split & reorganize files

import { Webview, Uri, ViewColumn, WebviewPanel, window } from 'vscode'
import { ext } from '../../../extensionVariables'
import { getUri } from '../../../ui/getUri'

export function getCreateSchemaViewContent(
  webview: Webview,
  extensionUri: Uri,
) {
  const toolkitUri = getUri(webview, extensionUri, [
    'node_modules',
    '@vscode',
    'webview-ui-toolkit',
    'dist',
    'toolkit.js',
  ])

  const styleUri = getUri(webview, extensionUri, ['media', 'style.css'])
  const scriptUri = getUri(webview, extensionUri, ['src', 'features', 'schema-manager', 'webviews', 'schemaBuilder.js'])

  return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script type="module" src="${toolkitUri}"></script>
      <script type="module" src="${scriptUri}"></script>
      <link rel="stylesheet" href="${styleUri}">
      <title>Schema Builder</title>
    </head>

    <body>
      <form id="schema-builder-form" style="margin: 20px 0px;">
        <section class="wrapper">
          <div class="box-row">
            <div class="box">
              <div class="box">
                <label>Schema type</label>
                <vscode-text-field size="40" id="schemaType"></vscode-text-field>
              </div>
              <div class="box">
                <label>Description (optional)</label>
                <vscode-text-area rows="4" cols="50" id="schemaDescription"></vscode-text-area>
              </div>
            </div>
          </div> 
          <div class="box-row">
            <vscode-checkbox id="isSchemaPublic">Make this schema public</vscode-checkbox>
          </div>
        </section>

        <div class="divider"></div>

        <section id="schemaAttributes"></section>

        <div class="divider"></div>

        <section> 
          <vscode-button id="submit-button">Publish the schema</vscode-button>
        </section>
      </form>
    </body>
  </html>
`
}

export function openSchemaBuilder() {
  let schemaBuilderPanel: WebviewPanel | undefined
  if (!schemaBuilderPanel) {
    schemaBuilderPanel = window.createWebviewPanel(
      'schemaBuilderView',
      'Schema Builder',
      ViewColumn.One,
      {
        enableScripts: true,
      },
    )
  }

  schemaBuilderPanel.webview.html = getCreateSchemaViewContent(
    schemaBuilderPanel.webview,
    ext.context.extensionUri,
  )

  schemaBuilderPanel.webview.onDidReceiveMessage(
    ({ command, data }) => {
      if (command === 'submit') {
        const { schema } = data

        if (!isValidSchemaType(schema.type)) {
          window.showErrorMessage('Invalid schema type. Use PascalCase and alphanumeric symbols (for example, "MySchema")')
          return
        }

        if (schema.attributes.length === 0) {
          window.showErrorMessage('Your schema is empty. Try adding an attribute.')
          return
        }

        for (const attribute of schema.attributes) {
          if (!attribute.name) {
            window.showErrorMessage('Empty attribute name. Use camelCase and alphanumeric symbols (for example, "firstName")')
            return
          }

          if (!isValidAttributeName(attribute.name)) {
            window.showErrorMessage(`Invalid attribute name: "${attribute.name}". Use camelCase and alphanumeric symbols (for example, "firstName")`)
            return
          }
        }

        console.log(schema)
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

function isValidSchemaType(value: string) {
  return /^[a-zA-Z0-9]{2,}$/.test(value)
}

function isValidAttributeName(value: string) {
  return /^[a-zA-Z0-9_-]+$/.test(value)
}
