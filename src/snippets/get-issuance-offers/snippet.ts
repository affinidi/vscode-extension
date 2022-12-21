import { createSnippetCommand } from '../shared/createSnippetCommand'
import { Implementations } from '../shared/createSnippetTools'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'

import * as javascript from './javascript'
import * as typescript from './typescript'
import { iamState } from '../../features/iam/iamState'
import { issuanceHelpers } from '../../features/issuance/issuanceHelpers'
import { ext } from '../../extensionVariables'

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
    const projectId = input?.projectId ?? (await ext.configuration.getActiveProjectId())
    if (!projectId) return undefined

    const projectSummary = await iamState.getProjectSummary(projectId)
    if (!projectSummary) return undefined

    const issuanceId =
      input?.issuanceId ?? (await issuanceHelpers.askForIssuance({ projectId }))?.id
    if (!issuanceId) return undefined

    return {
      issuanceApiUrl: ISSUANCE_API_URL,
      apiKeyHash: projectSummary.apiKey.apiKeyHash,
      issuanceId,
      projectId,
    }
  },
)
