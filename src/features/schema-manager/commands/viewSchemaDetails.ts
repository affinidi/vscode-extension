import { TreeView, Uri, ViewColumn, Webview, window } from 'vscode'
import { ext } from '../../../extensionVariables'
import { AffResourceTreeItem } from '../../../treeView/treeItem'
import { getUri } from '../../../utils/getUri'
import { telemetryClient, EventNames, EventSubCategory } from '../../telemetry/telemetryClient'

function generateHtml(webview: Webview, extensionUri: Uri, item: AffResourceTreeItem) {
  const toolkitUri = getUri(webview, extensionUri, [
    'node_modules',
    '@vscode',
    'webview-ui-toolkit',
    'dist',
    'toolkit.js',
  ])
  const styleUri = getUri(webview, extensionUri, ['media', 'style.css'])
  const schema = item.metadata

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <link rel="stylesheet" href="${styleUri}">
        <title>${item.label}</title>
      </head>
      <body>
        <section class="wrapper">
          <div class="box-row">
            <div class="box">
              <div class="title">SCHEMA TYPE</div>
              <div class="description">${item.label}</div>
            </div>

            <div class="box">
              <div class="title">VERSION</div>
              <div class="description">${schema?.version}</div>
            </div>

            <div class="box">
              <div class="title">REVISION</div>
              <div class="description">${schema?.revision}</div>
            </div>

            <div class="box">
              <div class="title">DESCRIPTION</div>
              <div class="description">${schema?.description}</div>
            </div>
          </div>

          <vscode-divider></vscode-divider>

          <div class="box">
            <div class="title">JSON SCHEMA</div>
            <div class="description">
              <vscode-link href="${schema?.jsonSchemaUrl}">${schema?.jsonSchemaUrl}</vscode-link>
            </div>
          </div>

          <div class="box">
            <div class="title">JSON-LD CONTEXT</div>
            <div class="description">
              <vscode-link href="${schema?.jsonLdContextUrl}">${schema?.jsonLdContextUrl}</vscode-link>
            </div>
          </div>
        </section>
      </body>
    </html>
  `
}

export async function viewSchemaDetails(input: { treeView: TreeView<unknown> }) {
  const selectedTreeViewItem = input.treeView.selection[0]
  if (!(selectedTreeViewItem instanceof AffResourceTreeItem)) return

  const label = selectedTreeViewItem.label?.toString() ?? 'Schema Details'

  const panel = window.createWebviewPanel('schemaDetails', label, ViewColumn.One, {
    enableScripts: true,
  })

  panel.title = label
  panel.webview.html = generateHtml(panel.webview, ext.context.extensionUri, selectedTreeViewItem)

  telemetryClient.sendEvent({
    name: EventNames.commandExecuted,
    subCategory: EventSubCategory.command,
    metadata: {
      commandId: 'schema.viewSchemaDetails',
      projectId: selectedTreeViewItem.projectId,
    },
  })
}
