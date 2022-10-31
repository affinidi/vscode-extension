import { sandbox } from "../../setup";
import { insertSendVcOfferToEmailSnippet } from "../../../../snippets/send-vc-offer-to-email/snippet";
import { SnippetImplementation } from "../../../../snippets/shared/createSnippetTools";
import { iamService } from "../../../../services/iamService";
import { expect } from "chai";
import { TextEditor, window, workspace } from "vscode";
import { ISSUANCE_API_BASE } from "../../../../services/issuancesService";

describe("insertSendVcOfferToEmailSnippet()", () => {
  let editor: TextEditor;
  beforeEach(async () => {
    editor = await window.showTextDocument(
      await workspace.openTextDocument({
        language: 'javascript',
      })
    );
  });

  it("should insert a snippet", async () => {
    const projectId = "fake-project-id";
    const apiKeyHash = "fake-api-key-hash";
    const did = "fake-did";
    const email = "fake@example.com";
    const type = "MySchema";
    const jsonSchemaUrl = "http://example.com/MySchema.json";
    const jsonLdContextUrl = "http://example.com/MySchema.jsonld";

    sandbox.stub(iamService, "getProjectSummary").resolves({
      apiKey: { apiKeyHash },
      wallet: { did },
    } as any);

    await insertSendVcOfferToEmailSnippet(
      {
        projectId,
        email,
        schema: {
          type,
          jsonSchemaUrl,
          jsonLdContextUrl,
        },
      },
      SnippetImplementation.axios,
      editor,
    );

    const text = editor.document.getText();
    for (const value of [
      "axios",
      `'${ISSUANCE_API_BASE}/v1/issuances'`,
      `\`${ISSUANCE_API_BASE}/v1/issuances/\${issuanceData.id}/offers\``,
      projectId,
      apiKeyHash,
      did,
      email,
      type,
      jsonSchemaUrl,
      jsonLdContextUrl,
    ]) {
      expect(text).contains(value);
    }
  });
});
