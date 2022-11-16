import { ExplorerResourceTypes } from '../treeView/treeTypes'

export const viewMarkdown = async (resourceType: ExplorerResourceTypes) => {
  let uri: string = ''

  switch (resourceType) {
    case ExplorerResourceTypes.rootIssuance:
      uri = '/document/bulkIssuance.md'
      break
    case ExplorerResourceTypes.rootSchemas:
      uri = '/document/schemaManager.md'
      break
    default:
      throw new Error(`Unexpected resource type: ${resourceType}`)
  }

  return uri
}
