import { iamHelpers } from '../../features/iam/iamHelpers'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { Implementations } from '../shared/createSnippetTools'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'

import * as javascript from './javascript'
import * as typescript from './typescript'
import { iamState } from '../../features/iam/iamState'
import { issuanceHelpers } from '../../features/issuance/issuanceHelpers'

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
    const projectId = input?.projectId ?? (await iamHelpers.askForProjectId())
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
    } = await iamState.requireProjectSummary(projectId)

    const issuanceId =
      input?.issuanceId ?? (await issuanceHelpers.askForIssuance({ projectId }))?.id
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
