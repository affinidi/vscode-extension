import { window } from 'vscode'
import { Schema } from '../../utils/types'
import { Implementations } from '../shared/createSnippetTools'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelpers } from '../../features/schema-manager/schemaManagerHelpers'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'
import { generateCredentialSubjectSample } from '../../features/issuance/json-schema/columnsToObject'
import { authMessage, snippetMessage } from '../../messages/messages'
import { iamState } from '../../features/iam/iamState'
import { ext } from '../../extensionVariables'

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
    const projectId = input?.projectId ?? (await ext.configuration.getActiveProjectId())
    if (!projectId) return undefined

    const projectSummary = await iamState.getProjectSummary(projectId)
    if (!projectSummary) return undefined

    const schema =
      input?.schema ??
      (await schemaManagerHelpers.askForAuthoredSchema({ projectId, includeExample: true }))
    if (!schema) return undefined

    const credentialSubject = await generateCredentialSubjectSample(schema)
    if (!credentialSubject) {
      throw new Error(snippetMessage.credentialSubjectGeneration)
    }

    const email =
      input?.email ??
      (await window.showInputBox({
        prompt: authMessage.enterEmail,
      }))

    return {
      issuanceApiUrl: ISSUANCE_API_URL,
      issuerDid: projectSummary.wallet.did,
      apiKeyHash: projectSummary.apiKey.apiKeyHash,
      projectId,
      email,
      schema,
      credentialSubject,
    }
  },
)
