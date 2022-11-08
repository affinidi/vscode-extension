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
} from "vscode";
import { getSchema } from "../services/schemaManagerService";
import { insertGetIssuanceOffersSnippet } from "../snippets/get-issuance-offers/snippet";
import { insertSendVcOfferToEmailSnippet } from "../snippets/send-vc-offer-to-email/snippet";
import { SnippetCommand } from "../snippets/shared/createSnippetCommand";
import { insertSignVcWithCloudWalletSnippet } from "../snippets/sign-vc-with-cloud-wallet/snippet";
import { AffResourceTreeItem, AffCodeGenTreeItem } from "./treeItem";

// 1/@did:elem:EiARLWJVMinRbZ2wr...wTOGAPUEWAo3rTq-AjJ1sKw/MySchemaV1-0
const ITEM_ID_REGEX = /^\d+?\/(?<value>.*)$/;

const SNIPPET_COMMANDS: Record<string, SnippetCommand<any>> = {
  sendVcOfferToEmail: insertSendVcOfferToEmailSnippet,
  getIssuanceOffers: insertGetIssuanceOffersSnippet,
  signVcWithCloudWallet: insertSignVcWithCloudWalletSnippet,
};

export class AffinidiDragAndDropProvider
  implements TreeDragAndDropController<TreeItem>, DocumentDropEditProvider
{
  dropMimeTypes = [];
  dragMimeTypes = [];

  async handleDrag(
    source: TreeItem[],
    treeDataTransfer: DataTransfer
  ): Promise<void> {
    const [selectedItem] = source;

    if (
      selectedItem instanceof AffResourceTreeItem &&
      selectedItem.resourceType === "schema"
    ) {
      treeDataTransfer.set(
        "application/vnd.code.tree.affinidiexplorer",
        new DataTransferItem(source)
      );
      return;
    }

    if (selectedItem instanceof AffCodeGenTreeItem) {
      treeDataTransfer.set(
        "application/vnd.code.tree.affinidicodegeneration",
        new DataTransferItem(source)
      );
      return;
    }
  }

  async provideDocumentDropEdits(
    _document: TextDocument,
    position: Position,
    dataTransfer: DataTransfer,
    token: CancellationToken
  ): Promise<DocumentDropEdit> {
    const editor = window.visibleTextEditors.find(
      (editor) => editor.document === _document
    );

    const resourceItem = dataTransfer.get(
      "application/vnd.code.tree.affinidiexplorer"
    );
    if (resourceItem) {
      await this.handleResourceDrop(
        this.parseItem(resourceItem),
        editor,
        position
      );
    }

    const snippetItem = dataTransfer.get(
      "application/vnd.code.tree.affinidicodegeneration"
    );
    if (snippetItem) {
      await this.handleSnippetDrop(
        this.parseItem(snippetItem),
        editor,
        position
      );
    }

    return { insertText: '' };
  }

  private async handleResourceDrop(
    item: { resourceType: string; metadata: any },
    editor: TextEditor | undefined,
    position: Position
  ) {
    if (item.resourceType === "schema") {
      const { projectId, id } = item.metadata;

      const schema = await getSchema(id);
      if (!schema) {
        return;
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
        position
      );
    }
  }

  private async handleSnippetDrop(
    item: { id: string },
    editor: TextEditor | undefined,
    position: Position
  ) {
    const snippetCommand = SNIPPET_COMMANDS[item.id];
    if (!snippetCommand) {
      return;
    }

    await snippetCommand(undefined, undefined, editor, position);
  }

  // { value: '{"id":"affinidiExplorer","itemHandles":["1/@did:elem:EiARLWJVMinRbZ2wr...wTOGAPUEWAo3rTq-AjJ1sKw/MySchemaV1-0"]}' }
  private parseItem(item: DataTransferItem): any | undefined {
    const itemHandle: string = JSON.parse(item.value).itemHandles[0];
    const match = itemHandle.match(ITEM_ID_REGEX);

    if (!match?.groups?.value) {
      return;
    }

    return JSON.parse(match.groups.value);
  }
}
