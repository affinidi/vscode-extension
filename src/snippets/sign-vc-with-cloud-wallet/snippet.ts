import { nanoid } from 'nanoid'
import { Schema } from '../../utils/types'
import { Implementations } from '../shared/createSnippetTools'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelpers } from '../../features/schema-manager/schemaManagerHelpers'
import { AFFINIDI_IAM_API_URL } from '../../features/iam/iamClient'
import { generateCredentialSubjectSample } from '../../features/issuance/json-schema/columnsToObject'
import { snippetMessage } from '../../messages/messages'
import { iamState } from '../../features/iam/iamState'
import { ext } from '../../extensionVariables'

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
}

export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
}

export const CLOUD_WALLET_API_URL = 'https://cloud-wallet-api.prod.affinity-project.org/api/v1'

export const insertSignVcWithCloudWalletSnippet = createSnippetCommand<SnippetInput, CommandInput>(
  'signVcWithCloudWallet',
  implementations,
  async (input) => {
    const projectId = input?.projectId ?? (await ext.configuration.getActiveProjectId())
    if (!projectId) return undefined

    const projectSummary = await iamState.getProjectSummary(projectId)
    if (!projectSummary) return undefined

    const schema =
      input?.schema ??
      (await schemaManagerHelpers.askForAuthoredSchema({ projectId, includeExample: true }))
    if (!schema) return undefined

    const credentialSubject = await generateCredentialSubjectSample(schema)
    if (!credentialSubject) {
      throw new Error(snippetMessage.credentialSubjectGeneration)
    }

    return {
      iamUrl: AFFINIDI_IAM_API_URL,
      cloudWalletApiUrl: CLOUD_WALLET_API_URL,
      issuerDid: projectSummary.wallet.did,
      apiKeyHash: projectSummary.apiKey.apiKeyHash,
      projectId,
      claimId: nanoid(),
      schema,
      credentialSubject,
    }
  },
)
