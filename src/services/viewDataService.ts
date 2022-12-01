import { ProjectSummary } from '@affinidi/client-iam'
import { IssuanceDto } from '@affinidi/client-issuance'
import { SchemaDto } from '@affinidi/client-schema-manager'
import fetch from 'node-fetch'
import { issuancesState } from '../states/issuancesState'
import { projectsState } from '../states/projectsState'
import { schemasState } from '../states/schemasState'
import { ExplorerResourceTypes } from '../tree/types'
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
  let content: ProjectSummary | SchemaDto | IssuanceDto = projectsState.getProjectById(projectId)
  switch (resourceType) {
    case ExplorerResourceTypes.project: {
      label = content.project.name
      id = content.project.projectId
      break
    }

    case ExplorerResourceTypes.schema: {
      const schema = schemasState.getSchemaById(schemaId)

      if (schema) {
        content = schema
        label = schema.id
        id = schema.id
      }
      break
    }

    case ExplorerResourceTypes.issuance: {
      const issuance = issuancesState.getIssuanceById(issuanceId)

      if (issuance) {
        content = issuance
        label = issuance.id
        id = issuance.id
      }
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
