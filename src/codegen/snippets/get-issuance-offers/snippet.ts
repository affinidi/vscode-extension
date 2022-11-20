import { createSnippetCommand } from '../_shared/createSnippetCommand'
import { Implementations } from '../_shared/createSnippetTools'
import { ISSUANCE_API_URL } from '../../../features/issuance/issuanceClient'

import * as javascript from './javascript'
import * as typescript from './typescript'
import { authHelper } from '../../../auth/authHelper'
import { requireProjectSummary } from '../../../features/iam/requireProjectSummary'
import { iamHelper } from '../../../features/iam/iamHelper'
import { issuanceHelper } from '../../../features/issuance/IssuanceHelper'

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

    const projectId = input?.projectId ?? (await iamHelper.askForProjectId({ consoleAuthToken }))
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
    } = await requireProjectSummary(projectId, { consoleAuthToken })

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
