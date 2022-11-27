// TODO: state is not saved when switching tabs
// TODO: handle "init" and "enableSubmit"

import { l10n, ProgressLocation, ViewColumn, WebviewPanel, window } from 'vscode'
import { ext } from '../../../extensionVariables'
import { schemasState } from '../../../states/schemasState'
import { getWebviewUri } from '../../../utils/getWebviewUri'
import { showSchemaDetails } from '../schema-details/showSchemaDetails'
import { publishBuilderSchema } from './helpers/publishBuilderSchema'
import { isValidSchemaType, isValidAttributeName } from './helpers/validation'

export type BuilderAttribute = {
  id: string
  parentId?: string
  name: string
  description: string
  type: string
  isRequired: boolean
}

export type BuilderSchema = {
  type: string
  description: string
  isPublic: boolean
  attributes: BuilderAttribute[]
}

type IngoingMessage = { command: 'submit'; data: { schema: BuilderSchema } }
type OutgoingMessage = { command: 'init' } | { command: 'enableSubmit' }

export class SchemaBuilderWebview {
  private panel: WebviewPanel | undefined

  constructor(readonly projectId: string) {}

  open() {
    if (!this.panel) {
      this.panel = window.createWebviewPanel(
        'schemaBuilderView',
        'Schema Builder',
        ViewColumn.One,
        {
          enableScripts: true,
        },
      )

      this.panel.webview.onDidReceiveMessage(
        this.handleMessage,
        undefined,
        ext.context.subscriptions,
      )
      this.panel.onDidDispose(() => this.dispose(), null, ext.context.subscriptions)
    }

    this.render()
    this.sendMessage({ command: 'init' }) // TODO: handle this in webview

    this.panel.reveal()
  }

  dispose() {
    this.panel?.dispose()
    this.panel = undefined
  }

  private handleMessage = async (message: IngoingMessage) => {
    const { command, data } = message

    if (command === 'submit') {
      try {
        const { schema } = data

        if (!isValidSchemaType(schema.type)) {
          window.showErrorMessage(
            'Invalid schema type. Use PascalCase and alphanumeric symbols (for example, "MySchema")',
          )
          return
        }

        if (schema.attributes.length === 0) {
          window.showErrorMessage('Your schema is empty. Try adding an attribute.')
          return
        }

        for (const attribute of schema.attributes) {
          if (!attribute.name) {
            window.showErrorMessage(
              'Empty attribute name. Use camelCase and alphanumeric symbols (for example, "firstName")',
            )
            return
          }

          if (!isValidAttributeName(attribute.name)) {
            window.showErrorMessage(
              `Invalid attribute name: "${attribute.name}". Use camelCase and alphanumeric symbols (for example, "firstName")`,
            )
            return
          }
        }

        const createdSchema = await window.withProgress(
          { location: ProgressLocation.Notification, title: 'Publishing the schema...' },
          () => publishBuilderSchema(schema, this.projectId),
        )

        window.showInformationMessage(l10n.t('Schema has been successfully created'))
        showSchemaDetails(createdSchema)
        schemasState.clear()
        ext.explorerTree.refresh()
        this.dispose()
      } finally {
        if (!this.isDisposed()) {
          this.sendMessage({ command: 'enableSubmit' })
        }
      }
    }
  }

  private sendMessage(message: OutgoingMessage) {
    this.requirePanel().webview.postMessage(message)
  }

  private render() {
    const webview = this.requirePanel().webview
    const extensionUri = ext.context.extensionUri

    const toolkitUri = getWebviewUri(webview, extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ])

    const styleUri = getWebviewUri(webview, extensionUri, ['media', 'style.css'])
    const scriptUri = getWebviewUri(webview, extensionUri, [
      'src',
      'features',
      'schema-manager',
      'schema-builder',
      'assets',
      'main.js',
    ])

    webview.html = `
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

  private requirePanel() {
    if (!this.panel) {
      throw new Error('Webview panel is not opened')
    }

    return this.panel
  }

  isDisposed(): boolean {
    return !this.panel
  }
}
