import { ExplorerProvider } from '../../../tree/explorerTree'
import { BasicTreeItem } from '../../../tree/basicTreeItem'
import { iamState } from '../../iam/iamState'
import { issuanceState } from '../issuanceState'
import { ProjectFeatureTreeItem } from '../../iam/tree/treeItems'
import { Feature } from '../../feature'
import { IssuanceTreeItem } from './treeItems'
import { issuanceHelpers } from '../issuanceHelpers'
import { notifyError } from '../../../utils/notifyError'
import { genericMessage } from '../../../messages/messages'

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
    const projectSummary = await iamState.getProjectSummary(parent.projectId)
    if (!projectSummary) {
      notifyError(new Error(genericMessage.projectIsRequired))
      return []
    }

    const {
      project: { projectId },
    } = projectSummary

    const issuances = await issuanceState.listIssuances({ projectId })

    return issuances.map(
      (issuance) =>
        new IssuanceTreeItem({
          issuanceId: issuance.id,
          label: issuanceHelpers.getIssuanceName(issuance),
          description: issuance.id,
          projectId: parent.projectId,
        }),
    )
  }
}
