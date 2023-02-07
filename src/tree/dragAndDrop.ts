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
  window,
} from 'vscode'
import { schemaManagerState } from '../features/schema-manager/schemaManagerState'
import { insertGetIssuanceOffersSnippet } from '../snippets/get-issuance-offers/snippet'
import { insertSendVcOfferToEmailSnippet } from '../snippets/send-vc-offer-to-email/snippet'
import { SnippetCommand } from '../snippets/shared/createSnippetCommand'
import { insertSignVcWithCloudWalletSnippet } from '../snippets/sign-vc-with-cloud-wallet/snippet'
import { labels } from './messages'
import { BasicTreeItemWithProject } from './basicTreeItemWithProject'

import { credentialsVault } from '../config/credentialsVault'
import { SchemaTreeItem } from '../features/schema-manager/tree/treeItems'

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
    const project = credentialsVault.getActiveProjectSummary()

    if (resourceItem && project) {
      const {
        project: { projectId },
        wallet: { did },
      } = project
      const resourceItemAsString = await resourceItem.asString()

      if (resourceItemAsString.includes(':Issuances')) {
        const id = this.parseIssuanceItem(resourceItem)
        await this.handleResourceDrop({ id, projectId, resource: 'issuance' }, editor, position)
      }

      if (resourceItemAsString.includes('Schemas/0')) {
        let id = this.parseItems(resourceItem)
        if (resourceItemAsString.includes('Unlisted')) {
          id = `@${did}/${id}`
        }
        await this.handleResourceDrop({ id, projectId, resource: 'schema' }, editor, position)
      }
    }
    const snippetItem = dataTransfer.get('application/vnd.code.tree.affinididevtools')
    if (snippetItem) {
      await this.handleSnippetDrop(this.parseItems(snippetItem), editor, position)
    }

    return { insertText: '' }
  }

  private async handleResourceDrop(
    item: { resource: string; id: string; projectId: string },
    editor: TextEditor | undefined,
    position: Position,
  ) {
    if (item.resource === 'schema') {
      const { projectId, id } = item

      const schema = await schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: id })
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

    if (item.resource === 'issuance') {
      const { projectId, id } = item
      await insertGetIssuanceOffersSnippet(
        {
          issuanceId: id,
          projectId,
        },
        undefined,
        editor,
        position,
      )
    }
  }

  private async handleSnippetDrop(
    label: string,
    editor: TextEditor | undefined,
    position: Position,
  ) {
    const snippetCommand = SNIPPET_COMMANDS[`${label}`]
    if (!snippetCommand) {
      return
    }
    await snippetCommand(undefined, undefined, editor, position)
  }

  // { value: '{"id":"affinidiExplorer","itemHandles":["1/@did:elem:EiARLWJVMinRbZ2wr...wTOGAPUEWAo3rTq-AjJ1sKw/MySchemaV1-0"]}' }
  private parseItems(item: DataTransferItem): any | undefined {
    const itemHandle: string = JSON.parse(item.value).itemHandles[0]
    return itemHandle.split(':').at(-1)
  }

  private parseIssuanceItem(item: DataTransferItem): any | undefined {
    const itemHandle: string = JSON.parse(item.value).itemHandles[0]
    return itemHandle.split('(').at(-1)?.replace(')', '')
  }
}
