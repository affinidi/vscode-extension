import { iamState } from '../features/iam/iamState'
import { ProjectTreeItem } from '../features/iam/tree/treeItems'
import { issuanceHelpers } from '../features/issuance/issuanceHelpers'
import { issuanceState } from '../features/issuance/issuanceState'
import { IssuanceTreeItem } from '../features/issuance/tree/treeItems'
import { schemaManagerHelpers } from '../features/schema-manager/schemaManagerHelpers'
import { schemaManagerState } from '../features/schema-manager/schemaManagerState'
import { SchemaTreeItem } from '../features/schema-manager/tree/treeItems'
import { BasicTreeItem } from '../tree/basicTreeItem'
import { logger } from '../utils/logger'
import { readOnlyContentViewer } from '../utils/openReadOnlyContent'

export const viewElementProperties = async (element: BasicTreeItem) => {
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
    label = schemaManagerHelpers.getSchemaName(schema)
    id = schema.id
  } else if (element instanceof IssuanceTreeItem) {
    const issuance = await issuanceState.getIssuanceById({
      projectId: element.projectId,
      issuanceId: element.issuanceId,
    })
    if (!issuance) return

    content = issuance
    label = issuanceHelpers.getIssuanceName(issuance)
    id = issuance.id
  } else {
    logger.warn(element, 'Unknown element')
    return
  }

  await readOnlyContentViewer.open({ node: { label, id }, content })
}


