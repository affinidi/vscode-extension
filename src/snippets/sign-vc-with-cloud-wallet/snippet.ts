import { nanoid } from 'nanoid'
import { Schema } from '../../utils/types'
import { Implementations } from '../shared/createSnippetTools'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelpers } from '../../features/schema-manager/schemaManagerHelpers'
import { AFFINIDI_IAM_API_URL } from '../../features/iam/iamClient'
import { generateCredentialSubjectSample } from '../../features/issuance/json-schema/columnsToObject'
import { snippetMessage } from '../messages'
import { iamState } from '../../features/iam/iamState'
import { configVault } from '../../config/configVault'
import { CLOUD_WALLET_API_URL } from '../../features/cloud-wallet'
import { continueWithoutLogin } from '../../auth/authHelper'

export interface SnippetInput {
  iamUrl: string
  cloudWalletApiUrl: string
  apiKeyHash: string
  issuerDid: string
  claimId: string
  schema: Schema
  credentialSubject: object
}

interface CommandInput {
  projectId?: string
  schema?: Schema
  isLoggedIn?: boolean
}

export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
}

export const insertSignVcWithCloudWalletSnippet = createSnippetCommand<SnippetInput, CommandInput>(
  'signVcWithCloudWallet',
  implementations,
  async (input) => {
    const isLoggedIn = await continueWithoutLogin()

    const projectId = isLoggedIn
      ? input?.projectId ?? (await configVault.requireActiveProjectId())
      : '<PROJECT_ID>'
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
      wallet: { did },
    } = isLoggedIn
      ? await iamState.requireProjectSummary(projectId)
      : { apiKey: { apiKeyHash: '<API_KEY_HASH>' }, wallet: { did: '<DID>' } }

    const schema = isLoggedIn
      ? input?.schema ??
        (await schemaManagerHelpers.askForAuthoredSchema({ projectId, includeExample: true }))
      : {
          type: '<SCHEMA_TYPE>',
          jsonLdContextUrl: '<JSON_LD_CONTEXT_URL>',
          jsonSchemaUrl: '<JSON_SCHEMA_URL>',
        }
    if (!schema) {
      return undefined
    }

    const credentialSubject = isLoggedIn ? await generateCredentialSubjectSample(schema) : {}
    if (!credentialSubject) {
      throw new Error(snippetMessage.credentialSubjectGeneration)
    }

    return {
      iamUrl: AFFINIDI_IAM_API_URL,
      cloudWalletApiUrl: CLOUD_WALLET_API_URL,
      issuerDid: did,
      apiKeyHash,
      projectId,
      claimId: nanoid(),
      schema,
      credentialSubject,
    }
  },
)
