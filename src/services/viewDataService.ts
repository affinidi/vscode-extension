import fetch from 'node-fetch'
import { iamState } from '../features/iam/iamState'
import { issuanceState } from '../features/issuance/issuanceState'
import { schemaManagerState } from '../features/schema-manager/schemaManagerState'
import { ExplorerResourceTypes } from '../tree/explorerTree'
import { openReadOnlyContent } from '../utils/openReadOnlyContent'

type ViewPropertiesProps = {
  projectId: string
  resourceType: ExplorerResourceTypes
  issuanceId?: string
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
  let content: any = await iamState.requireProjectSummary(projectId)
  switch (resourceType) {
    case ExplorerResourceTypes.project: {
      label = content.project.name
      id = content.project.projectId
      break
    }

    case ExplorerResourceTypes.schema: {
      const schema = await schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: schemaId! })

      if (schema) {
        content = schema
        label = schema.id
        id = schema.id
      }
      break
    }

    case ExplorerResourceTypes.issuance: {
      const issuance = await issuanceState.getIssuanceById({ projectId, issuanceId: issuanceId! })

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
