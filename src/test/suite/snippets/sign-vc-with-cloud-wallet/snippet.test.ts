import { expect } from 'chai'
import { sandbox } from '../../setup'
import {
  CLOUD_WALLET_API_URL,
  implementations,
  insertSignVcWithCloudWalletSnippet,
} from '../../../../snippets/sign-vc-with-cloud-wallet/snippet'
import { AFFINIDI_IAM_API_URL, iamClient } from '../../../../features/iam/iamClient'
import { testSnippet } from '../helpers'
import { authHelper } from '../../../../auth/authHelper'
import { projectsState } from '../../../../states/projectsState'

describe('insertSignVcWithCloudWalletSnippet()', () => {
  testSnippet(implementations, async ({ editor, implementation }) => {
    const projectId = 'fake-project-id'
    const apiKeyHash = 'fake-api-key-hash'
    const did = 'fake-did'
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

    projectsState.setProject(projectSummary)

    await insertSignVcWithCloudWalletSnippet(
      {
        projectId,
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

    projectsState.clear()
  })
})
