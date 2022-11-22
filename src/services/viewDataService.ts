import { ProjectSummary } from '@affinidi/client-iam'
import { IssuanceDto } from '@affinidi/client-issuance'
import { SchemaDto } from '@affinidi/client-schema-manager'
import fetch from 'node-fetch'
import { issuancesState } from '../states/issuancesState'
import { projectsState } from '../states/projectsState'
import { schemasState } from '../states/schemasState'
import { ExplorerResourceTypes } from '../treeView/treeTypes'
import { openReadOnlyContent } from '../utils/openReadOnlyContent'

type ViewPropertiesProps = {
  resourceType: ExplorerResourceTypes
  issuanceId?: string
  projectId?: string
  schemaId?: string
}

export const viewProperties = async ({
  resourceType,
  issuanceId,
  projectId,
  schemaId,
}: ViewPropertiesProps) => {
  let label: string = ''
  let id: string = ''
  let content: ProjectSummary | SchemaDto | IssuanceDto
  switch (resourceType) {
    case ExplorerResourceTypes.project: {
      const projectSummary = projectsState.getProjectById(projectId)
      content = projectSummary
      label = projectSummary.project.name
      id = projectSummary.project.projectId
      break
    }

    case ExplorerResourceTypes.schema: {
      const schema = schemasState.getSchemaById(schemaId)
      content = schema
      label = schema.id
      id = schema.id
      break
    }

    case ExplorerResourceTypes.issuance: {
      const issuance = issuancesState.getIssuanceById(issuanceId)
      content = issuance
      label = issuance.id
      id = issuance.id
      break
    }

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
