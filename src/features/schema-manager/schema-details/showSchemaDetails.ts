import { SchemaDto } from '@affinidi/client-schema-manager'
import { l10n, Uri, ViewColumn, Webview, WebviewPanel, window } from 'vscode'
import { ext } from '../../../extensionVariables'
import { getWebviewUri } from '../../../utils/getWebviewUri'
import { schemaManagerHelpers } from '../schemaManagerHelpers'

let panel: WebviewPanel | undefined

function renderSchemaDetails(input: { webview: Webview; extensionUri: Uri; schema: SchemaDto }) {
  const { webview, extensionUri, schema } = input

  const styleUri = getWebviewUri(webview, extensionUri, ['media', 'style.css'])
  const toolkitUri = getWebviewUri(webview, extensionUri, ['media', 'vendor', 'toolkit.js'])

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <link rel="stylesheet" href="${styleUri}">
        <title>Schema Details</title>
      </head>
      <body>
        <section class="wrapper">
          <div class="box-row">
            <div class="box">
              <div class="title">SCHEMA TYPE</div>
              <div class="description">${schema.type}</div>
            </div>

            <div class="box">
              <div class="title">VERSION</div>
              <div class="description">${schema.version}</div>
            </div>

            <div class="box">
              <div class="title">REVISION</div>
              <div class="description">${schema.revision}</div>
            </div>

            <div class="box">
              <div class="title">DESCRIPTION</div>
              <div class="description">${schema.description}</div>
            </div>
          </div>

          <vscode-divider></vscode-divider>

          <div class="box">
            <div class="title">JSON SCHEMA</div>
            <div class="description">
              <vscode-link href="${schema.jsonSchemaUrl}">${schema.jsonSchemaUrl}</vscode-link>
            </div>
          </div>

          <div class="box">
            <div class="title">JSON-LD CONTEXT</div>
            <div class="description">
              <vscode-link href="${schema.jsonLdContextUrl}">${schema.jsonLdContextUrl}</vscode-link>
            </div>
          </div>
        </section>
      </body>
    </html>
  `
}

export function showSchemaDetails(schema: SchemaDto) {
  if (!panel) {
    panel = window.createWebviewPanel('schemaDetailsView', '', ViewColumn.One, {
      enableScripts: true,
    })

    panel.onDidDispose(() => (panel = undefined), null, ext.context.subscriptions)
  }

  panel.title = l10n.t('Schema: {0}', schemaManagerHelpers.getSchemaName(schema))
  panel.webview.html = renderSchemaDetails({
    webview: panel.webview,
    extensionUri: ext.context.extensionUri,
    schema,
  })
}
