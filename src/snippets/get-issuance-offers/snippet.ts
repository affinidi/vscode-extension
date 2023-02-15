import { createSnippetCommand } from '../shared/createSnippetCommand'
import { Implementations } from '../shared/createSnippetTools'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'

import * as javascript from './javascript'
import * as typescript from './typescript'
import { iamState } from '../../features/iam/iamState'
import { issuanceHelpers } from '../../features/issuance/issuanceHelpers'
import { configVault } from '../../config/configVault'
import { continueWithoutLogin } from '../../auth/authHelper'

export interface SnippetInput {
  issuanceApiUrl: string
  apiKeyHash: string
  issuanceId?: string
}

export interface CommandInput {
  projectId?: string
  issuanceId?: string
  isLoggedIn?: boolean
}

export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
}

export const insertGetIssuanceOffersSnippet = createSnippetCommand<SnippetInput, CommandInput>(
  'getIssuanceOffers',
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
    } = isLoggedIn
      ? await iamState.requireProjectSummary(projectId)
      : { apiKey: { apiKeyHash: '<API_KEY_HASH>' } }

    const issuanceId = isLoggedIn
      ? input?.issuanceId ?? (await issuanceHelpers.askForIssuance({ projectId }))?.id
      : '<ISSUANCE_ID>'
    if (!issuanceId) {
      return undefined
    }

    return {
      issuanceApiUrl: ISSUANCE_API_URL,
      apiKeyHash,
      issuanceId,
      projectId,
    }
  },
)
