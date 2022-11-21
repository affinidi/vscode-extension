import { Webview, Uri } from 'vscode'
import { getUri } from './getUri'

function getAttributeHtml(attributeId: number) {
  return /* html */ `
  <section class="wrapper"> 
    <div class="box-row">
      <vscode-text-field placeholder="Enter attribute name" size="40" id="atr-name-${attributeId}">Attribute name</vscode-text-field>
      <vscode-text-field placeholder="Enter attribute description" size="40" id="atr-desc-${attributeId}">Attribute description</vscode-text-field>
      
      <div class="box">
        <label>Input type</label>
        <vscode-dropdown id="atr-input-type-${attributeId}">
          <vscode-option value="object">nest attributes</vscode-option>
          <vscode-option value="did">DID</vscode-option>
          <vscode-option value="text">Text</vscode-option>
          <vscode-option value="url">URI</vscode-option>
          <vscode-option value="date">Date</vscode-option>
          <vscode-option value="datettime">DateTime</vscode-option>
          <vscode-option value="number">Number</vscode-option>
          <vscode-option value="boolean">Boolean</vscode-option>
        </vscode-dropdown>
      </div>

      <vscode-button id="add-attribute">Add Attribute</vscode-button>
      </div>
  </section>
`
}

/**
 * Defines and returns the HTML that should be rendered within the notepad webview panel.
 *
 * @remarks This is also the place where references to CSS and JavaScript files/packages
 * (such as the Webview UI Toolkit) are created and inserted into the webview HTML.
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param item An object representing an object
 * @returns A template string literal containing the HTML that should be
 * rendered within the webview panel
 */
export function getCreateSchemaViewContent(
  webview: Webview,
  extensionUri: Uri,
  attributes: { id: number }[],
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
      </br></br>
      <section class="wrapper">
        <div class="box-row">
          <div class="box">
            <vscode-text-field placeholder="Enter schema type" size="40" id="schema-type">Schema type</vscode-text-field>
              <div class="box-row">
                <vscode-text-field placeholder="1" id="version">Version</vscode-text-field>
                <vscode-text-field placeholder="0" id="revision">Revision</vscode-text-field>
              </div>
          </div>
          <div class="box">
            <vscode-text-area placeholder="Enter description" rows="4" cols="50" id="schema-desc">Description</vscode-text-area>
          </div>
        </div> 
        <div class="box-row">
          <vscode-checkbox id="schema-public" Make this schema public</vscode-checkbox>
        </div>
      </section>
      ${attributes.map((attribute) => getAttributeHtml(attribute.id)).join('\n')}
      <section> 
        <vscode-button id="create-schema">Create Schema</vscode-button>
      </section>
    
      <script> 
        window.addEventListener('load', () => {
          const vscode = acquireVsCodeApi()
          const addAttributeButton = document.getElementById('add-attribute')
          
          addAttributeButton.addEventListener('click', () => {
            const attributeId = vscode.getState()?.attributeId ?? 1
            vscode.setState({ attributeId: attributeId + 1 })
            vscode.postMessage({
              command: 'addAttribute',
              id: attributeId + 1
            })
          })
        })

      </script>
    </body>
  </html>
`
}
