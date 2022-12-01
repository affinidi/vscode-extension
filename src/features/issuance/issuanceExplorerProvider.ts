import { ThemeIcon } from 'vscode'
import { ExplorerProvider, ExplorerResourceTypes } from '../../tree/explorerTree'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { iamState } from '../iam/iamState'
import { formatIssuanceName } from './formatIssuanceName'
import { issuanceState } from './issuanceState'

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

  private async getIssuanceItems(parent: ExplorerTreeItem) {
    const {
      project: { projectId },
    } = await iamState.requireProjectSummary(parent.projectId!)

    const issuances = await issuanceState.listIssuances({ projectId })

    return issuances.map(
      (issuance) =>
        new ExplorerTreeItem({
          resourceType: ExplorerResourceTypes.issuance,
          issuanceId: issuance.id,
          label: formatIssuanceName(issuance),
          description: issuance.id,
          icon: new ThemeIcon('output'),
          projectId: parent?.projectId,
        }),
    )
  }
}
