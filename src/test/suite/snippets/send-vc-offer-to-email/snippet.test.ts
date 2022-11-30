import { expect } from 'chai'
import { sandbox } from '../../setup'
import {
  implementations,
  insertSendVcOfferToEmailSnippet,
} from '../../../../snippets/send-vc-offer-to-email/snippet'
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
    const jsonSchemaUrl = 'https://schema.affinidi.com/MySchemaV1-0.json'
    const jsonLdContextUrl = 'https://schema.affinidi.com/MySchemaV1-0.jsonld'
    const projectSummary = {
      wallet: {
        didUrl: '',
        did,
      },
      apiKey: {
        apiKeyHash,
        apiKeyName: '',
      },
      project: {
        projectId,
        name: '',
        createdAt: '',
      },
    }

    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves('fake-console-auth-token')
    sandbox.stub(iamClient, 'getProjectSummary').resolves(projectSummary)

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
