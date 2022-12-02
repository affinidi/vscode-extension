import { Feature } from '../features/feature'
import { errorMessage } from '../messages/messages'

export const getFeatureMarkdownUri = async (feature: Feature) => {
  let uri: string = ''

  switch (feature) {
    case Feature.ISSUANCES:
      uri = '/document/bulkIssuance.md'
      break
    case Feature.SCHEMAS:
      uri = '/document/schemaManager.md'
      break
    default:
      throw new Error(`${errorMessage.unexpectedResourceType} ${feature}`)
  }

  return uri
}
