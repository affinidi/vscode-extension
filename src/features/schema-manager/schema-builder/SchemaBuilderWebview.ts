import { ViewColumn, WebviewPanel, window } from 'vscode'
import { ext } from '../../../extensionVariables'
import { errorMessage, labels } from '../../../messages/messages'
import { getWebviewUri } from '../../../utils/getWebviewUri'
import { logger } from '../../../utils/logger'
import { SubmitHandler } from './handlers/SubmitHandler'

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
type OutgoingMessage =
  | { command: 'init' }
  | { command: 'enableSubmit' }
  | { command: 'setScope'; data: { scope: string } }

export class SchemaBuilderWebview {
  private panel: WebviewPanel | undefined

  constructor(readonly projectId: string, private readonly submitHandler: SubmitHandler) {}

  open() {
    if (!this.panel) {
      this.panel = window.createWebviewPanel(
        'schemaBuilderView',
        labels.schemaBuilder,
        ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
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
    this.sendMessage({ command: 'init' })

    this.panel.reveal()
  }

  setScope(scope: 'public' | 'unlisted') {
    this.sendMessage({ command: 'setScope', data: { scope } })
  }

  dispose() {
    this.panel?.dispose()
    this.panel = undefined
  }

  private handleMessage = async (message: IngoingMessage) => {
    const { command, data } = message

    if (command === 'submit') {
      await this.submitHandler.handle(this, data)
    } else {
      logger.warn(message, labels.unknownCommand)
    }
  }

  sendMessage(message: OutgoingMessage) {
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
          <form class="schema" style="margin: 20px 0px;">
            <section class="wrapper">
              <div class="box-row">
                <div class="box">
                  <div class="box">
                    <label>Schema type</label>
                    <vscode-text-field size="40" class="schema__type"></vscode-text-field>
                  </div>
                  <div class="box">
                    <label>Description (optional)</label>
                    <vscode-text-area rows="4" cols="50" class="schema__description"></vscode-text-area>
                  </div>
                </div>
              </div> 
              <div class="box-row">
                <vscode-checkbox class="schema__is-public">Make this schema public</vscode-checkbox>
              </div>
            </section>
    
            <div class="divider"></div>
    
            <section class="schema__attributes"></section>
    
            <div class="divider"></div>
    
            <section> 
              <vscode-button class="schema__submit-button">Publish the schema</vscode-button>
            </section>
          </form>
        </body>
      </html>
    `
  }

  private requirePanel() {
    if (!this.panel) {
      throw new Error(errorMessage.webpanelNotOpen)
    }

    return this.panel
  }

  isDisposed(): boolean {
    return !this.panel
  }
}
