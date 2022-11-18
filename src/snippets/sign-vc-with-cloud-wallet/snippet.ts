import { nanoid } from 'nanoid'
import { Schema } from '../../shared/types'
import { Implementations } from '../shared/createSnippetTools'
import { iamHelper } from '../../features/iam/iamHelper'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelper } from '../../features/schema-manager/schemaManagerHelper'
import { authHelper } from '../../auth/authHelper'
import { requireProjectSummary } from '../../features/iam/requireProjectSummary'
import { AFFINIDI_IAM_API_URL } from '../../features/iam/iamClient'

export interface SnippetInput {
  iamUrl: string
  cloudWalletApiUrl: string
  apiKeyHash: string
  issuerDid: string
  claimId: string
  schema: Schema
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
    const consoleAuthToken = await authHelper.getConsoleAuthToken()

    const projectId = input?.projectId ?? (await iamHelper.askForProjectId({ consoleAuthToken }))
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
      wallet: { did },
    } = await requireProjectSummary(projectId, { consoleAuthToken })

    const schema =
      input?.schema ??
      (await schemaManagerHelper.askForMySchema({ includeExample: true, did }, { apiKeyHash }))
    if (!schema) {
      return undefined
    }

    return {
      iamUrl: AFFINIDI_IAM_API_URL,
      cloudWalletApiUrl: CLOUD_WALLET_API_URL,
      issuerDid: did,
      apiKeyHash,
      projectId,
      claimId: nanoid(),
      schema,
    }
  },
)
