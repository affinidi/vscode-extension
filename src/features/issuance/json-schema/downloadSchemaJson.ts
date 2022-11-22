import { Options } from '@affinidi/client-issuance'
import { window, workspace } from 'vscode'
import fetch from 'node-fetch'
import { iamHelpers } from '../../iam/iamHelpers'
import { schemaManagerHelper } from '../../schema-manager/schemaManagerHelper'

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

export const downloadSchemaFile = async (options: Options) => {
  const summary = await getSummary()
  if (!summary) {
    return undefined
  }

  const schema = await schemaManagerHelper.askForMySchema({ did: summary?.did }, options)

  const downloadableSchemaObject = await fetch(`${schema?.jsonSchemaUrl}`)
    .then((res) => res.json())
    .then((out) => {
      const { credentialSubject } = out.properties
      return credentialSubject
    })
    .catch((err) => console.error(err))

  return window.showTextDocument(
    await workspace.openTextDocument({
      language: 'plaintext',
      content: JSON.stringify(downloadableSchemaObject, null, '\t'),
    }),
  )
}
