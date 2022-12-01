import fetch from 'node-fetch'
import { iamState } from '../features/iam/iamState'
import { ProjectTreeItem } from '../features/iam/tree/treeItems'
import { issuanceState } from '../features/issuance/issuanceState'
import { IssuanceTreeItem } from '../features/issuance/tree/treeItems'
import { schemaManagerState } from '../features/schema-manager/schemaManagerState'
import { SchemaTreeItem } from '../features/schema-manager/tree/treeItems'
import { BasicTreeItem } from '../tree/basicTreeItem'
import { logger } from '../utils/logger'
import { openReadOnlyContent } from '../utils/openReadOnlyContent'

export const viewProperties = async (element: BasicTreeItem) => {
  let label: string = ''
  let id: string = ''
  let content: any = {}

  if (element instanceof ProjectTreeItem) {
    const projectSummary = await iamState.requireProjectSummary(element.projectId)

    label = projectSummary.project.name
    id = element.projectId
    content = projectSummary
  } else if (element instanceof SchemaTreeItem) {
    const schema = await schemaManagerState.getAuthoredSchemaById({
      projectId: element.projectId,
      schemaId: element.schemaId,
    })
    if (!schema) return

    content = schema
    label = schema.id
    id = schema.id
  } else if (element instanceof IssuanceTreeItem) {
    const issuance = await issuanceState.getIssuanceById({
      projectId: element.projectId,
      issuanceId: element.issuanceId,
    })
    if (!issuance) return

    content = issuance
    label = issuance.id
    id = issuance.id
  } else {
    logger.warn(element, 'Unknown element')
    return
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
