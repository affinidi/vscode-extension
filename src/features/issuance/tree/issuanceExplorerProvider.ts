import { ExplorerProvider } from '../../../tree/explorerTree'
import { BasicTreeItem } from '../../../tree/basicTreeItem'
import { iamState } from '../../iam/iamState'
import { formatIssuanceName } from '../formatIssuanceName'
import { issuanceState } from '../issuanceState'
import { ProjectFeatureTreeItem } from '../../iam/tree/treeItems'
import { Feature } from '../../feature'
import { IssuanceTreeItem } from './treeItems'

export class IssuanceExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: BasicTreeItem | undefined,
  ): Promise<BasicTreeItem[] | undefined> {
    if (element === undefined) return undefined

    if (element instanceof ProjectFeatureTreeItem && element.feature === Feature.ISSUANCES) {
      return this.getIssuanceItems(element)
    }
  }

  private async getIssuanceItems(parent: ProjectFeatureTreeItem) {
    const {
      project: { projectId },
    } = await iamState.requireProjectSummary(parent.projectId)

    const issuances = await issuanceState.listIssuances({ projectId })

    return issuances.map(
      (issuance) =>
        new IssuanceTreeItem({
          issuanceId: issuance.id,
          label: formatIssuanceName(issuance),
          description: issuance.id,
          projectId: parent.projectId,
        }),
    )
  }
}
