import fetch from 'node-fetch'
import { projectsState } from '../states/projectsState'
import { ExplorerResourceTypes } from '../treeView/treeTypes'
import { openReadOnlyContent } from '../utils/openReadOnlyContent'

type ViewPropertiesProps = {
  resourceType: ExplorerResourceTypes
  resourceInfo: any
  projectId?: string
}

export const viewProperties = async ({
  resourceType,
  resourceInfo,
  projectId,
}: ViewPropertiesProps) => {
  let label: string = ''
  let id: string = ''
  let content: any
  switch (resourceType) {
    case ExplorerResourceTypes.project: {
      const projectSummary = projectsState.getProjectById(projectId)
      content = projectSummary
      label = projectSummary.project.name
      id = projectSummary.project.projectId
      break
    }

    case ExplorerResourceTypes.issuance:
    case ExplorerResourceTypes.schema:
      content = resourceInfo
      label = resourceInfo.id
      id = resourceInfo.id
      break

    default:
      throw new Error(`Unexpected resource type: ${resourceType}`)
  }

  await openReadOnlyContent({ node: { label, id }, content })
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
