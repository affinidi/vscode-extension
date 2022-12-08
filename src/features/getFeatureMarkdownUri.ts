import { Feature } from './feature'
import { errorMessage } from '../messages/messages'

export const getFeatureMarkdownUri = async (feature: Feature) => {
  let uri: string = ''

  switch (feature) {
    case Feature.ISSUANCES:
      uri = '/document/issuance.md'
      break
    case Feature.SCHEMAS:
      uri = '/document/vcSchemas.md'
      break
    default:
      throw new Error(`${errorMessage.unexpectedResourceType} ${feature}`)
  }

  return uri
}
