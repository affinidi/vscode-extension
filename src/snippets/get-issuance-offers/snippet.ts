import { askForProjectId } from '../../features/iam/askForProjectId'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { Implementations } from '../shared/createSnippetTools'
import { askForIssuanceId } from '../../features/issuance/askForIssuanceId'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'

import * as javascript from './javascript'
import * as typescript from './typescript'
import { authHelper } from '../../auth/authHelper'
import { requireProjectSummary } from '../../features/iam/requireProjectSummary'

export interface SnippetInput {
  issuanceApiUrl: string
  apiKeyHash: string
  issuanceId?: string
}

export interface CommandInput {
  projectId?: string
  issuanceId?: string
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
    const consoleAuthToken = await authHelper.getConsoleAuthToken()

    const projectId = input?.projectId ?? (await askForProjectId({ consoleAuthToken }))
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
    } = await requireProjectSummary(projectId, { consoleAuthToken })

    const issuanceId = input?.issuanceId ?? (await askForIssuanceId({ projectId }, { apiKeyHash }))
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
