import { Feature } from '../features/feature'

export const viewFeatureMarkdown = async (feature: Feature) => {
  let uri: string = ''

  switch (feature) {
    case Feature.ISSUANCES:
      uri = '/document/bulkIssuance.md'
      break
    case Feature.SCHEMAS:
      uri = '/document/schemaManager.md'
      break
    default:
      throw new Error(`Unexpected resource type: ${feature}`)
  }

  return uri
}
