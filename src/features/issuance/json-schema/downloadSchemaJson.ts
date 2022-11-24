import { Options } from '@affinidi/client-issuance'
import { iamHelpers } from '../../iam/iamHelpers'
import { schemaManagerHelper } from '../../schema-manager/schemaManagerHelper'
import { generateSampleFromJsonSchema } from './columnsToObject'

const getSummary = async () => {
  const projectId = await iamHelpers.askForProjectId()
  if (!projectId) {
    return undefined
  }

  const {
    apiKey: { apiKeyHash },
    wallet: { did },
  } = await iamHelpers.requireProjectSummary(projectId)

  return {
    projectId,
    apiKeyHash,
    did,
  }
}

export const downloadCredentialSubject = async (options: Options) => {
  const summary = await getSummary()
  if (!summary) {
    return undefined
  }

  const schema = await schemaManagerHelper.askForMySchema({ did: summary?.did }, options)
  if (!schema) {
    return undefined
  }

  const downloadableCredentialObject = await generateSampleFromJsonSchema(schema.jsonSchemaUrl)
  if (!downloadableCredentialObject) {
    return undefined
  }

  return downloadableCredentialObject
}
