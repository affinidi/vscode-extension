import { expect } from 'chai'
import { sandbox } from '../../setup'
import {
  implementations,
  insertGetIssuanceOffersSnippet,
} from '../../../../snippets/get-issuance-offers/snippet'
import { iamClient } from '../../../../features/iam/iamClient'
import { ISSUANCE_API_URL } from '../../../../features/issuance/issuanceClient'
import { testSnippet } from '../helpers'
import { authHelper } from '../../../../auth/authHelper'

describe('insertGetIssuanceOffersSnippet()', () => {
  testSnippet(implementations, async ({ editor, implementation }) => {
    const projectId = 'fake-project-id'
    const issuanceId = 'fake-issuance-id'
    const apiKeyHash = 'fake-api-key-hash'

    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves('fake-console-auth-token')
    sandbox.stub(iamClient, 'getProjectSummary').resolves({
      apiKey: { apiKeyHash },
    } as any)

    await insertGetIssuanceOffersSnippet(
      {
        projectId,
        issuanceId,
      },
      implementation,
      editor,
    )

    const text = editor.document.getText()
    for (const value of [
      `\`${ISSUANCE_API_URL}/issuances/\${issuanceId}/offers\``,
      issuanceId,
      apiKeyHash,
    ]) {
      expect(text).contains(value)
    }
  })
})
