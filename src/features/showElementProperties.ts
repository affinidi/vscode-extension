import { iamState } from './iam/iamState'
import { InactiveProjectTreeItem, ProjectTreeItem } from './iam/tree/treeItems'
import { issuanceHelpers } from './issuance/issuanceHelpers'
import { issuanceState } from './issuance/issuanceState'
import { IssuanceTreeItem } from './issuance/tree/treeItems'
import { schemaManagerHelpers } from './schema-manager/schemaManagerHelpers'
import { schemaManagerState } from './schema-manager/schemaManagerState'
import { SchemaTreeItem } from './schema-manager/tree/treeItems'
import { BasicTreeItem } from '../tree/basicTreeItem'
import { logger } from '../utils/logger'
import { readOnlyContentViewer } from '../utils/openReadOnlyContent'

export const showElementProperties = async (element: BasicTreeItem) => {
  let label: string = ''
  let id: string = ''
  let content: any = {}

  if (element instanceof ProjectTreeItem || element instanceof InactiveProjectTreeItem) {
    const projectSummary = await iamState.getProjectSummary(element.projectId)
    if (!projectSummary) return

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
