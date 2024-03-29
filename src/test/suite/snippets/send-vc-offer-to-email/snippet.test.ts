import { expect } from 'chai'
import { sandbox } from '../../setup'
import {
  implementations,
  insertSendVcOfferToEmailSnippet,
} from '../../../../snippets/send-vc-offer-to-email/snippet'
import { ISSUANCE_API_URL } from '../../../../features/issuance/issuanceClient'
import { testSnippet } from '../helpers'
import { authHelper } from '../../../../auth/authHelper'
import { iamState } from '../../../../features/iam/iamState'
import { generateProjectId, generateProjectSummary } from '../../helpers'

describe('insertSendVcOfferToEmailSnippet()', () => {
  testSnippet(implementations, async ({ editor, implementation }) => {
    const projectId = generateProjectId()
    const apiKeyHash = 'fake-api-key-hash'
    const did = 'fake-did'
    const email = 'fake@example.com'
    const type = 'MySchema'
    const jsonSchemaUrl = 'https://schema.affinidi.com/MySchemaV1-0.json'
    const jsonLdContextUrl = 'https://schema.affinidi.com/MySchemaV1-0.jsonld'
    const projectSummary = generateProjectSummary({ projectId, did, apiKeyHash })

    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves('fake-console-auth-token')
    sandbox.stub(iamState, 'requireProjectSummary').withArgs(projectId).resolves(projectSummary)
    sandbox.stub(authHelper, 'continueWithoutLogin').resolves(true)

    await insertSendVcOfferToEmailSnippet(
      {
        projectId,
        email,
        isLoggedIn: true,
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
