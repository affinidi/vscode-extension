import { window } from 'vscode'
import { Schema } from '../../utils/types'
import { Implementations } from '../shared/createSnippetTools'
import * as javascript from './javascript'
import * as typescript from './typescript'
import { createSnippetCommand } from '../shared/createSnippetCommand'
import { schemaManagerHelpers } from '../../features/schema-manager/schemaManagerHelpers'
import { ISSUANCE_API_URL } from '../../features/issuance/issuanceClient'
import { generateCredentialSubjectSample } from '../../features/issuance/json-schema/columnsToObject'
import { snippetMessage } from '../messages'
import { iamState } from '../../features/iam/iamState'
import { configVault } from '../../config/configVault'
import { authHelper } from '../../auth/authHelper'

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
  isLoggedIn?: boolean
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
    const isLoggedIn = await authHelper.continueWithoutLogin()

    const projectId = isLoggedIn
      ? input?.projectId ?? (await configVault.requireActiveProjectId())
      : '<PROJECT_ID>'
    if (!projectId) {
      return undefined
    }

    const {
      apiKey: { apiKeyHash },
      wallet: { did },
    } = isLoggedIn
      ? await iamState.requireProjectSummary(projectId)
      : { apiKey: { apiKeyHash: '<API_KEY_HASH>' }, wallet: { did: '<DID>' } }

    const schema = isLoggedIn
      ? input?.schema ??
        (await schemaManagerHelpers.askForAuthoredSchema({ projectId, includeExample: true }))
      : {
          type: '<SCHEMA_TYPE>',
          jsonLdContextUrl: '<JSON_LD_CONTEXT_URL>',
          jsonSchemaUrl: '<JSON_SCHEMA_URL>',
        }
    if (!schema) {
      return undefined
    }

    const credentialSubject = isLoggedIn ? await generateCredentialSubjectSample(schema) : {}
    if (!credentialSubject) {
      throw new Error(snippetMessage.credentialSubjectGeneration)
    }

    const email = isLoggedIn
      ? input?.email ??
        (await window.showInputBox({
          prompt: snippetMessage.enterEmail,
        }))
      : '<EMAIL>'

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
