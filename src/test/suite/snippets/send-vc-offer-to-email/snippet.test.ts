import { expect } from 'chai'
import { sandbox } from '../../setup'
import {
  implementations,
  insertSendVcOfferToEmailSnippet,
} from '../../../../codegen/snippets/send-vc-offer-to-email/snippet'
import { iamClient } from '../../../../features/iam/iamClient'
import { ISSUANCE_API_URL } from '../../../../features/issuance/issuanceClient'
import { testSnippet } from '../helpers'
import { authHelper } from '../../../../auth/authHelper'

describe('insertSendVcOfferToEmailSnippet()', () => {
  testSnippet(implementations, async ({ editor, implementation }) => {
    const projectId = 'fake-project-id'
    const apiKeyHash = 'fake-api-key-hash'
    const did = 'fake-did'
    const email = 'fake@example.com'
    const type = 'MySchema'
    const jsonSchemaUrl = 'http://example.com/MySchema.json'
    const jsonLdContextUrl = 'http://example.com/MySchema.jsonld'

    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves('fake-console-auth-token')
    sandbox.stub(iamClient, 'getProjectSummary').resolves({
      apiKey: { apiKeyHash },
      wallet: { did },
    } as any)

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
      implementation,
      editor,
    )

    const text = editor.document.getText()
    for (const value of [
      `'${ISSUANCE_API_URL}/issuances'`,
      `\`${ISSUANCE_API_URL}/issuances/\${issuanceData.id}/offers\``,
      projectId,
      apiKeyHash,
      did,
      email,
      type,
      jsonSchemaUrl,
      jsonLdContextUrl,
    ]) {
      expect(text).contains(value)
    }
  })
})
