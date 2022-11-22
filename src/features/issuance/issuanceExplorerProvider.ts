import { ThemeIcon } from 'vscode'
import { projectsState } from '../../states/projectsState'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerProvider } from '../../tree/types'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'
import { formatIssuanceName } from './formatIssuanceName'
import { issuanceClient } from './issuanceClient'

export class IssuanceExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: ExplorerTreeItem | undefined,
  ): Promise<ExplorerTreeItem[] | undefined> {
    if (element === undefined) return undefined

    switch (element.resourceType) {
      case ExplorerResourceTypes.rootIssuance:
        return this.getIssuanceItems(element)
      default:
        return undefined
    }
  }

  private async getIssuanceItems(parent?: ExplorerTreeItem) {
    const {
      project: { projectId },
      apiKey: { apiKeyHash },
    } = projectsState.getProjectById(parent?.projectId)

    const { issuances } = await issuanceClient.searchIssuances({ projectId }, { apiKeyHash })

    return issuances.map(
      (issuance) =>
        new ExplorerTreeItem({
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
