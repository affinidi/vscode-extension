import { ExplorerResourceType } from '../tree/explorerTree'

export const viewMarkdown = async (resourceType: ExplorerResourceType) => {
  let uri: string = ''

  switch (resourceType) {
    case ExplorerResourceType.rootIssuance:
      uri = '/document/bulkIssuance.md'
      break
    case ExplorerResourceType.rootSchemas:
      uri = '/document/schemaManager.md'
      break
    default:
      throw new Error(`Unexpected resource type: ${resourceType}`)
  }

  return uri
}
