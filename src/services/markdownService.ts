import { ExplorerResourceType } from '../tree/explorerTree'

export const viewMarkdown = async (resourceType: ExplorerResourceType) => {
  let uri: string = ''

  switch (resourceType) {
    case ExplorerResourceType.issuances:
      uri = '/document/bulkIssuance.md'
      break
    case ExplorerResourceType.schemas:
      uri = '/document/schemaManager.md'
      break
    default:
      throw new Error(`Unexpected resource type: ${resourceType}`)
  }

  return uri
}
