import { parseSchema, SchemaField } from '@affinidi/affinidi-vc-schemas'
import { SchemaDto } from '@affinidi/client-schema-manager'
import { Uri, ViewColumn, Webview, WebviewPanel, window } from 'vscode'
import fetch from 'node-fetch'

import { ext } from '../../../extensionVariables'
import { labels } from '../../../messages/messages'
import { schemaMessage } from '../messages'
import { getWebviewUri } from '../../../utils/getWebviewUri'
import { csvCreationService } from '../../issuance/csvCreationService'
import { schemaManagerHelpers } from '../schemaManagerHelpers'
import { renderTree } from './renderTree'

let panel: WebviewPanel | undefined

const issuanceButtonId = 'initiate-issuance'

function renderSchemaDetails({
  webview,
  extensionUri,
  schema,
  schemaFields,
}: {
  webview: Webview
  extensionUri: Uri
  schema: SchemaDto
  schemaFields: SchemaField[]
}) {
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

            <div class="box issuance-button-box">
              <vscode-button id="${issuanceButtonId}">
                ${labels.initiateIssuanceCsvFlow}
              </vscode-button>
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
              <vscode-link href="${schema.jsonLdContextUrl}">
                ${schema.jsonLdContextUrl}
              </vscode-link>
            </div>
          </div>

          <vscode-divider></vscode-divider>

          <div class="attribute-box">
            <div class="flex flex-1">
              <div class="attribute-box parent-attribute-header flex-1">
                <div class="flex flex-1 attribute-details">
                  <div class="flex flex-1 text-bold">${schemaMessage.attributeName}</div>

                  <div class="flex">
                    <div class="attribute-type text-bold">${schemaMessage.type}</div>
                    <div class="attribute-required text-bold">${schemaMessage.required}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="attribute-box flex-1">
              ${renderTree(schemaFields)}
            </div>
          </div>
        </section>

        <script>
          const issuanceButton = document.getElementById("${issuanceButtonId}");
          const vscode = acquireVsCodeApi();

          issuanceButton.addEventListener('click', () => {
            vscode.postMessage({})
          })
        </script>
      </body>
    </html>
  `
}

export async function showSchemaDetails({
  projectId,
  schema,
}: {
  schema: SchemaDto
  projectId: string
}) {
  if (!panel) {
    panel = window.createWebviewPanel('schemaDetailsView', '', ViewColumn.One, {
      enableScripts: true,
    })

    panel.onDidDispose(
      () => {
        panel = undefined
      },
      null,
      ext.context.subscriptions,
    )

    panel.webview.onDidReceiveMessage(
      () => {
        csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })
      },
      undefined,
      ext.context.subscriptions,
    )
  }

  panel.title = `${labels.schema}: ${schemaManagerHelpers.getSchemaName(schema)}`

  const jsonSchema = await (await fetch(schema.jsonSchemaUrl)).json()
  const { fields } = parseSchema(jsonSchema)

  panel.webview.html = renderSchemaDetails({
    webview: panel.webview,
    extensionUri: ext.context.extensionUri,
    schema,
    schemaFields: fields,
  })
}
