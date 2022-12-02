import { errorMessage } from '../messages/messages'
import { ExplorerResourceTypes } from '../tree/types'

export const viewMarkdown = (resourceType: ExplorerResourceTypes) => {
  let uri: string = ''

  switch (resourceType) {
    case ExplorerResourceTypes.rootIssuance:
      uri = '/document/bulkIssuance.md'
      break
    case ExplorerResourceTypes.rootSchemas:
      uri = '/document/schemaManager.md'
      break
    default:
      throw new Error(`${errorMessage.unexpectedResourceType} ${resourceType}`)
  }

  return uri
}
