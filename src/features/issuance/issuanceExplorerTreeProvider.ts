import { ThemeIcon } from 'vscode'
import { TreeProvider } from '../../shared/treeProvider'
import { AffResourceTreeItem } from '../../treeView/treeItem'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'
import { projectsState } from '../iam/projectsState'
import { formatIssuanceName } from './formatIssuanceName'
import { issuanceClient } from './issuanceClient'

export class IssuanceExplorerTreeProvider implements TreeProvider<AffResourceTreeItem> {
  async getChildren(
    element: AffResourceTreeItem | undefined,
  ): Promise<AffResourceTreeItem[] | undefined> {
    if (element === undefined) return undefined

    switch (element.resourceType) {
      case ExplorerResourceTypes.rootIssuance:
        return this.getIssuanceItems(element)
      default:
        return undefined
    }
  }

  private async getIssuanceItems(parent?: AffResourceTreeItem) {
    const {
      project: { projectId },
      apiKey: { apiKeyHash },
    } = projectsState.getProjectById(parent?.projectId)

    const { issuances } = await issuanceClient.searchIssuances({ projectId }, { apiKeyHash })

    return issuances.map(
      (issuance) =>
        new AffResourceTreeItem({
          resourceType: ExplorerResourceTypes.issuance,
          metadata: issuance,
          label: formatIssuanceName(issuance),
          description: issuance.id,
          icon: new ThemeIcon('output'),
          projectId: parent?.projectId,
        }),
    )
  }
}
