import { sandbox } from "../../setup";
import { insertGetIssuanceOffersSnippet } from "../../../../snippets/get-issuance-offers/snippet";
import { SnippetImplementation } from "../../../../snippets/shared/createSnippetTools";
import { iamService } from "../../../../services/iamService";
import { expect } from "chai";
import { TextEditor, window, workspace } from "vscode";
import { ISSUANCE_API_BASE } from "../../../../services/issuancesService";

describe("insertGetIssuanceOffersSnippet()", () => {
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
    const issuanceId = 'fake-issuance-id';
    const apiKeyHash = "fake-api-key-hash";

    sandbox.stub(iamService, "getProjectSummary").resolves({
      apiKey: { apiKeyHash },
    } as any);

    await insertGetIssuanceOffersSnippet(
      {
        projectId,
        issuanceId,
      },
      SnippetImplementation.fetch,
      editor,
    );

    const text = editor.document.getText();
    for (const value of [
      "fetch",
      `\`${ISSUANCE_API_BASE}/v1/issuances/\${issuanceId}/offers\``,
      issuanceId,
      apiKeyHash,
    ]) {
      expect(text).contains(value);
    }
  });
});
