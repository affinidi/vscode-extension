import { window, l10n } from 'vscode'
import { Schema } from '../../shared/types'
import { Implementations } from '../shared/createSnippetTools'
import { iamHelpers } from '../../features/iam/iamHelpers'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelper } from '../../features/schema-manager/schemaManagerHelper'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'
import { downloadSchemaFile } from '../../features/issuance/json-schema/downloadSchemaJson'

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
    const projectId = input?.projectId ?? (await iamHelpers.askForProjectId())
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
      wallet: { did },
    } = iamHelpers.requireProjectSummary(projectId)

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

    const downloadedSchemaFile = await downloadSchemaFile({ apiKeyHash })

    return {
      issuanceApiUrl: ISSUANCE_API_URL,
      issuerDid: did,
      apiKeyHash,
      projectId,
      email,
      schema,
      downloadedSchemaFile,
    }
  },
)
