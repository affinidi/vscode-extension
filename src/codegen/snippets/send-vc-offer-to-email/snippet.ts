import { window, l10n } from 'vscode'
import { Schema } from '../../../shared/types'
import { Implementations } from '../_shared/createSnippetTools'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../_shared/createSnippetCommand'
import { authHelper } from '../../../auth/authHelper'
import { ISSUANCE_API_URL } from '../../../features/issuance/issuanceClient'
import { requireProjectSummary } from '../../../features/iam/requireProjectSummary'
import { iamHelper } from '../../../features/iam/iamHelper'
import { schemaManagerHelper } from '../../../features/schema-manager/schemaManagerHelper'

export interface SnippetInput {
  issuanceApiUrl: string
  apiKeyHash: string
  projectId: string
  issuerDid: string
  schema: Schema
  email?: string
}

export interface CommandInput {
  projectId?: string
  schema?: Schema
  email?: string
}

export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
}

export const insertSendVcOfferToEmailSnippet = createSnippetCommand<SnippetInput, CommandInput>(
  'sendVcOfferToEmail',
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

    const email =
      input?.email ??
      (await window.showInputBox({
        prompt: l10n.t('Enter an email to send the VC offer to'),
      }))

    return {
      issuanceApiUrl: ISSUANCE_API_URL,
      issuerDid: did,
      apiKeyHash,
      projectId,
      email,
      schema,
    }
  },
)
