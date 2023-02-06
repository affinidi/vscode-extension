import {
  CancellationToken,
  DataTransfer,
  DataTransferItem,
  DocumentDropEdit,
  DocumentDropEditProvider,
  Position,
  TextDocument,
  TextEditor,
  TreeDragAndDropController,
  TreeItem,
  window,
} from 'vscode'
import { schemaManagerState } from '../features/schema-manager/schemaManagerState'
import { SchemaTreeItem } from '../features/schema-manager/tree/treeItems'
import { insertGetIssuanceOffersSnippet } from '../snippets/get-issuance-offers/snippet'
import { insertSendVcOfferToEmailSnippet } from '../snippets/send-vc-offer-to-email/snippet'
import { SnippetCommand } from '../snippets/shared/createSnippetCommand'
import { insertSignVcWithCloudWalletSnippet } from '../snippets/sign-vc-with-cloud-wallet/snippet'
import { IssuanceTreeItem } from '../features/issuance/tree/treeItems'
import { DevToolsTreeItem } from './devToolsTreeItem'
import { labels } from './messages'
import { BasicTreeItemWithProject } from './basicTreeItemWithProject'

// 1/@did:elem:EiARLWJVMinRbZ2wr...wTOGAPUEWAo3rTq-AjJ1sKw/MySchemaV1-0
const ITEM_ID_REGEX = /^\d+?\/(?<value>.*)$/

const SNIPPET_COMMANDS: Record<string, SnippetCommand<any>> = {
  [`${labels.sendVCOfferToEmail}`]: insertSendVcOfferToEmailSnippet,
  [`${labels.getIssuanceOffers}`]: insertGetIssuanceOffersSnippet,
  [`${labels.signCloudWalletVc}`]: insertSignVcWithCloudWalletSnippet,
}

export class AffinidiDragAndDropProvider
  implements TreeDragAndDropController<BasicTreeItemWithProject>, DocumentDropEditProvider
{
  dropMimeTypes = []

  dragMimeTypes = []

  async handleDrag(
    source: BasicTreeItemWithProject[],
    treeDataTransfer: DataTransfer,
  ): Promise<void> {
    const [selectedItem] = source
    if (selectedItem instanceof SchemaTreeItem) {
      treeDataTransfer.set(
        'application/vnd.code.tree.affinidiExplorer',
        new DataTransferItem(source),
      )
      return
    }

    if (selectedItem instanceof IssuanceTreeItem) {
      treeDataTransfer.set(
        'application/vnd.code.tree.affinidiExplorer',
        new DataTransferItem(source),
      )
      return
    }

    if (selectedItem instanceof DevToolsTreeItem) {
      treeDataTransfer.set(
        'application/vnd.code.tree.affinidiDevTools',
        new DataTransferItem(source),
      )
    }
  }

  async provideDocumentDropEdits(
    _document: TextDocument,
    position: Position,
    dataTransfer: DataTransfer,
    token: CancellationToken,
  ): Promise<DocumentDropEdit> {
    const editor = window.visibleTextEditors.find((editor) => editor.document === _document)
    const resourceItem = dataTransfer.get('application/vnd.code.tree.affinidiexplorer')

    if (resourceItem) {
      await this.handleResourceDrop(this.parseItem(resourceItem), editor, position)
    }

    const snippetItem = dataTransfer.get('application/vnd.code.tree.affinididevtools')
    if (snippetItem) {
      await this.handleSnippetDrop(this.parseItem(snippetItem), editor, position)
    }

    return { insertText: '' }
  }

  private async handleResourceDrop(
    item: SchemaTreeItem | IssuanceTreeItem,
    editor: TextEditor | undefined,
    position: Position,
  ) {
    console.log('Item: ', item)
    if (item instanceof SchemaTreeItem) {
      const { projectId, schemaId } = item

      const schema = await schemaManagerState.getAuthoredSchemaById({ projectId, schemaId })

      if (!schema) {
        return
      }

      await insertSendVcOfferToEmailSnippet(
        {
          projectId,
          schema: {
            type: schema.type,
            jsonLdContextUrl: schema.jsonLdContextUrl,
            jsonSchemaUrl: schema.jsonSchemaUrl,
          },
        },
        undefined,
        editor,
        position,
      )
    }

    if (item instanceof IssuanceTreeItem) {
      const { projectId, issuanceId } = item
      await insertGetIssuanceOffersSnippet(
        {
          issuanceId,
          projectId,
        },
        undefined,
        editor,
        position,
      )
    }
  }

  private async handleSnippetDrop(
    item: DevToolsTreeItem,
    editor: TextEditor | undefined,
    position: Position,
  ) {
    const snippetCommand = SNIPPET_COMMANDS[`${item.label}`]
    if (!snippetCommand) {
      return
    }

    await snippetCommand(undefined, undefined, editor, position)
  }

  // { value: '{"id":"affinidiExplorer","itemHandles":["1/@did:elem:EiARLWJVMinRbZ2wr...wTOGAPUEWAo3rTq-AjJ1sKw/MySchemaV1-0"]}' }
  private parseItem(item: DataTransferItem): any | undefined {
    console.log({ item })
    const itemHandle: string = JSON.parse(item.value).itemHandles[0]
    const match = itemHandle.match(ITEM_ID_REGEX)
    console.log(match?.groups)
    if (!match?.groups?.value) {
      return
    }
    console.log('Parsed', JSON.parse(match?.groups?.value))

    return JSON.parse(match.groups.value)
  }
}
