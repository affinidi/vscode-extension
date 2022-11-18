import { askForProjectId } from '../../utils/askForProjectId'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { Implementations } from '../shared/createSnippetTools'
import { issuanceHelper } from '../../features/issuance/IssuanceHelper'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'

import * as javascript from './javascript'
import * as typescript from './typescript'
import { requireProjectSummary } from '../../utils/requireProjectSummary'

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
    const projectId = input?.projectId ?? (await askForProjectId())
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
    } = requireProjectSummary(projectId)

    const issuanceId =
      input?.issuanceId ?? (await issuanceHelper.askForIssuanceId({ projectId }, { apiKeyHash }))
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
