import { nanoid } from 'nanoid'
import { Schema } from '../../shared/types'
import { Implementations } from '../shared/createSnippetTools'
import { iamHelpers } from '../../features/iam/iamHelpers'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelpers } from '../../features/schema-manager/schemaManagerHelpers'
import { AFFINIDI_IAM_API_URL } from '../../features/iam/iamClient'
import { generateCredentialSubjectSample } from '../../features/issuance/json-schema/columnsToObject'
import { l10n } from 'vscode'
import { iamState } from '../../features/iam/iamState'

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
    const projectId = input?.projectId ?? (await iamHelpers.askForProjectId())
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
      wallet: { did },
    } = await iamState.requireProjectSummary(projectId)

    const schema =
      input?.schema ??
      (await schemaManagerHelpers.askForMySchema({ includeExample: true, did }, { apiKeyHash }))
    if (!schema) {
      return undefined
    }

    const credentialSubject = await generateCredentialSubjectSample(schema)
    if (!credentialSubject) {
      throw new Error(l10n.t('Could not generate credential subject sample'))
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
