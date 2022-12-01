import { window, l10n } from 'vscode'
import { Schema } from '../../shared/types'
import { Implementations } from '../shared/createSnippetTools'
import { iamHelpers } from '../../features/iam/iamHelpers'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelpers } from '../../features/schema-manager/schemaManagerHelpers'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'
import { generateCredentialSubjectSample } from '../../features/issuance/json-schema/columnsToObject'
import { iamState } from '../../features/iam/iamState'

export interface SnippetInput {
  issuanceApiUrl: string
  apiKeyHash: string
  projectId: string
  issuerDid: string
  schema: Schema
  credentialSubject: object
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
    } = await iamState.requireProjectSummary(projectId)

    const schema =
      input?.schema ??
      (await schemaManagerHelpers.askForAuthoredSchema({ projectId, includeExample: true }))
    if (!schema) {
      return undefined
    }

    const credentialSubject = await generateCredentialSubjectSample(schema)
    if (!credentialSubject) {
      throw new Error(l10n.t('Could not generate credential subject sample'))
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
      credentialSubject,
    }
  },
)
