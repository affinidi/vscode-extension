import { ThemeIcon } from 'vscode'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerProvider, ExplorerResourceTypes } from '../../tree/types'
import { issuanceHelpers } from './issuanceHelpers'
import { getIssuances } from './getIssuances'
import { iamHelpers } from '../iam/iamHelpers'

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
    } = iamHelpers.requireProjectSummary(parent?.projectId)

    const issuances = await getIssuances(projectId, { apiKeyHash })

    return issuances.map(
      (issuance) =>
        new ExplorerTreeItem({
          resourceType: ExplorerResourceTypes.issuance,
          issuanceId: issuance.id,
          label: issuanceHelpers.getIssuanceName(issuance),
          description: issuance.id,
          icon: new ThemeIcon('output'),
          projectId: parent?.projectId,
        }),
    )
  }
}
