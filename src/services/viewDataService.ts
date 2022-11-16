import fetch from 'node-fetch'
import { ExplorerResourceTypes } from '../treeView/treeTypes'
import { openReadOnlyContent } from '../utils/openReadOnlyContent'

export const viewProperties = async (resourceType: ExplorerResourceTypes, resourceInfo: any) => {
  let label: string = ''
  let id: string = ''
  switch (resourceType) {
    case ExplorerResourceTypes.project:
      label = resourceInfo.project.name
      id = resourceInfo.project.projectId
      break

    case ExplorerResourceTypes.issuance:
    case ExplorerResourceTypes.schema:
      label = resourceInfo.id
      id = resourceInfo.id
      break

    default:
      throw new Error(`Unexpected resource type: ${resourceType}`)
  }

  await openReadOnlyContent({ node: { label, id }, content: resourceInfo })
}

export const viewSchemaContent = async (
  schemaName: string,
  url: string,
  fileExtension?: string,
) => {
  const fetchedData = await fetch(url)
  const schemaContent = await fetchedData.json()
  await openReadOnlyContent({
    node: { label: schemaName, id: schemaName },
    content: schemaContent,
    fileExtension,
  })
}
