import { ViewColumn, WebviewPanel, window } from 'vscode'
import { ext } from '../../../extensionVariables'
import { errorMessage, labels } from '../../../messages/messages'
import { getWebviewUri } from '../../../utils/getWebviewUri'
import { logger } from '../../../utils/logger'
import { SubmitHandler } from './handlers/SubmitHandler'
import { createBuilderSchemaFork } from './helpers/createBuilderSchemaFork'

export type BuilderAttribute = {
  id: string
  parentId?: string
  name: string
  description: string
  type: string
  isRequired: boolean
}

export type BuilderSchema = {
  parentId?: string
  type: string
  description: string
  isPublic: boolean
  attributes: BuilderAttribute[]
}

type IngoingMessage = { command: 'submit'; data: { schema: BuilderSchema } }
type OutgoingMessage =
  | { command: 'init'; data?: { schema?: BuilderSchema } }
  | { command: 'enableSubmit' }
  | { command: 'setScope'; data: { scope: string } }

export class SchemaBuilderWebview {
  private panel: WebviewPanel | undefined

  constructor(
    readonly projectId: string,
    readonly parentSchemaId: string | undefined,
    private readonly submitHandler: SubmitHandler,
  ) {}

  async open() {
    let parentBuilderSchema: BuilderSchema | undefined
    if (this.parentSchemaId) {
      parentBuilderSchema = await createBuilderSchemaFork({
        projectId: this.projectId,
        schemaId: this.parentSchemaId,
      })
    }

    if (!this.panel) {
      this.panel = window.createWebviewPanel(
        'schemaBuilderView',
        parentBuilderSchema
          ? labels.schemaBuilderFork(parentBuilderSchema.type)
          : labels.schemaBuilder,
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
    this.sendMessage({
      command: 'init',
      data: { schema: parentBuilderSchema },
    })

    this.panel.reveal()
  }

  setScope(scope: 'public' | 'unlisted') {
    this.sendMessage({ command: 'setScope', data: { scope } })
  }

  dispose() {
    this.panel?.dispose()
    this.panel = undefined
  }

  private readonly handleMessage = async (message: IngoingMessage) => {
    const { command, data } = message

    if (command === 'submit') {
      await this.submitHandler.handle(this, data)
    } else {
      logger.warn(message, 'unknown command')
    }
  }

  sendMessage(message: OutgoingMessage) {
    this.requirePanel().webview.postMessage(message)
  }

  private render() {
    const { webview } = this.requirePanel()
    const { extensionUri } = ext.context

    const toolkitUri = getWebviewUri(webview, extensionUri, ['media', 'vendor', 'toolkit.js'])
    const styleUri = getWebviewUri(webview, extensionUri, ['media', 'style.css'])
    const scriptUri = getWebviewUri(webview, extensionUri, [
      'media',
      'schema-manager',
      'schema-builder.js',
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
              <vscode-button class="schema__submit-button"></vscode-button>
            </section>
          </form>
        </body>
      </html>
    `
  }

  private requirePanel() {
    if (!this.panel) {
      throw new Error(errorMessage.webPanelNotOpen)
    }

    return this.panel
  }

  isDisposed(): boolean {
    return !this.panel
  }
}
