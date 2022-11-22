import { Options } from '@affinidi/client-issuance'
import { window, workspace } from 'vscode'
import fetch from 'node-fetch'
import { iamHelpers } from '../../iam/iamHelpers'
import { schemaManagerHelper } from '../../schema-manager/schemaManagerHelper'
import { issuanceHelper } from '../IssuanceHelper'

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

export const getSearchedOffers = async (input: { issuanceId: string }, options: Options) => {
  const summary = await getSummary()
  if (!summary) {
    return undefined
  }

  const issuanceId = await issuanceHelper.askForIssuanceId(
    { projectId: summary?.projectId },
    { apiKeyHash: summary?.apiKeyHash },
  )
  if (!issuanceId) {
    return undefined
  }

  const searchOffers = await seachOffers(input, options)
  return searchOffers
}

export const downloadSchemaFile = async (options: Options) => {
  const summary = await getSummary()
  if (!summary) {
    return undefined
  }

  const schema = await schemaManagerHelper.askForMySchema({ did: summary?.did }, options)

  const schemaObject = await fetch(`${schema?.jsonSchemaUrl}`)
    .then((res) => res.json())
    .then((out) => {
      console.log('FullSchema: ', JSON.stringify(out, null, '\t'))
      const { credentialSubject } = out.properties
      return credentialSubject
    })
    .catch((err) => console.error(err))

  return window.showTextDocument(
    await workspace.openTextDocument({
      language: 'plaintext',
      content: JSON.stringify(schemaObject, null, '\t'),
    }),
  )
}
