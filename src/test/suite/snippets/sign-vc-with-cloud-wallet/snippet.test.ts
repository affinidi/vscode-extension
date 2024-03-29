import { expect } from 'chai'
import { sandbox } from '../../setup'
import {
  implementations,
  insertSignVcWithCloudWalletSnippet,
} from '../../../../snippets/sign-vc-with-cloud-wallet/snippet'
import { AFFINIDI_IAM_API_URL } from '../../../../features/iam/iamClient'
import { testSnippet } from '../helpers'
import { authHelper } from '../../../../auth/authHelper'
import { iamState } from '../../../../features/iam/iamState'
import { generateProjectId, generateProjectSummary } from '../../helpers'
import { CLOUD_WALLET_API_URL } from '../../../../features/cloud-wallet'

describe('insertSignVcWithCloudWalletSnippet()', () => {
  testSnippet(implementations, async ({ editor, implementation }) => {
    const projectId = generateProjectId()
    const apiKeyHash = 'fake-api-key-hash'
    const did = 'fake-did'
    const type = 'MySchema'
    const jsonSchemaUrl = 'https://schema.affinidi.com/MySchemaV1-0.json'
    const jsonLdContextUrl = 'https://schema.affinidi.com/MySchemaV1-0.jsonld'
    const projectSummary = generateProjectSummary({ did, projectId, apiKeyHash })

    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves('fake-console-auth-token')
    sandbox.stub(iamState, 'requireProjectSummary').withArgs(projectId).resolves(projectSummary)
    sandbox.stub(authHelper, 'continueWithoutLogin').resolves(true)

    await insertSignVcWithCloudWalletSnippet(
      {
        projectId,
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
      `'${CLOUD_WALLET_API_URL}/wallet/sign-credential'`,
      `\`${AFFINIDI_IAM_API_URL}/cloud-wallet/\${issuerDid}/authenticate\``,
      apiKeyHash,
      did,
      type,
      jsonSchemaUrl,
      jsonLdContextUrl,
    ]) {
      expect(text).contains(value)
    }
  })
})
