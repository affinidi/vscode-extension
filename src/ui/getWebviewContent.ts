import { Webview, Uri } from 'vscode'
import { schemasState } from '../states/schemasState'
import { getUri } from './getUri'

type GetWebviewContentProps = {
  webview: Webview
  extensionUri: Uri
  label: string
  schemaId?: string
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
export function getWebviewContent({
  webview,
  extensionUri,
  label,
  schemaId,
}: GetWebviewContentProps) {
  const toolkitUri = getUri(webview, extensionUri, [
    'node_modules',
    '@vscode',
    'webview-ui-toolkit',
    'dist',
    'toolkit.js',
  ])
  const styleUri = getUri(webview, extensionUri, ['media', 'style.css'])
  const schema = schemasState.getSchemaById(schemaId)

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="${toolkitUri}"></script>
        <link rel="stylesheet" href="${styleUri}">
        <title>${label}</title>
      </head>
      <body>
        <section class="wrapper">
          <div class="box-row">
            <div class="box">
              <div class="title">SCHEMA TYPE</div>
              <div class="description">${label}</div>
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
