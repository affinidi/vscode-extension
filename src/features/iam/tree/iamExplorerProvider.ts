import { ThemeIcon, l10n } from 'vscode'
import { ext } from '../../../extensionVariables'
import { BasicTreeItem } from '../../../tree/basicTreeItem'
import { ExplorerProvider } from '../../../tree/explorerTree'
import { Feature } from '../../feature'
import { iamState } from '../iamState'
import { ProjectTreeItem, ProjectFeatureTreeItem, DigitalIdentityTreeItem } from './treeItems'

export class IamExplorerProvider implements ExplorerProvider {
  public async getChildren(
    parent: BasicTreeItem | undefined,
  ): Promise<BasicTreeItem[] | undefined> {
    const isLoggedIn = await ext.authProvider.isLoggedIn()
    if (!isLoggedIn) return undefined

    if (parent === undefined) {
      return [
        ...(await this.getProjects()),
        new BasicTreeItem({
          label: l10n.t('Create Project'),
          icon: new ThemeIcon('file-directory-create'),
          command: 'affinidi.createProject',
        }),
      ]
    }

    if (parent instanceof ProjectTreeItem) {
      return this.getProjectFeatures(parent)
    }

    if (parent instanceof ProjectFeatureTreeItem && parent.feature === Feature.DIGITAL_IDENTITIES) {
      return this.getDigitalIdentities(parent)
    }

    return undefined
  }

  private async getProjects() {
    const projects = await iamState.listProjects()

    return projects.map(
      (project) =>
        new ProjectTreeItem({
          label: project.name,
          projectId: project.projectId,
        }),
    )
  }

  private async getProjectFeatures(parent: ProjectTreeItem) {
    return [
      new ProjectFeatureTreeItem({
        feature: Feature.DIGITAL_IDENTITIES,
        label: l10n.t('Digital Identities'),
        icon: new ThemeIcon('lock'),
        projectId: parent.projectId,
      }),
      new ProjectFeatureTreeItem({
        feature: Feature.ISSUANCES,
        label: l10n.t('Issuances'),
        icon: new ThemeIcon('output'),
        projectId: parent.projectId,
      }),
      new ProjectFeatureTreeItem({
        feature: Feature.SCHEMAS,
        label: l10n.t('VC Schemas'),
        icon: new ThemeIcon('bracket'),
        projectId: parent.projectId,
      }),
    ]
  }

  private async getDigitalIdentities(parent: ProjectFeatureTreeItem) {
    const projectSummary = await iamState.requireProjectSummary(parent.projectId)

    return [
      new DigitalIdentityTreeItem({
        projectId: parent.projectId,
        did: projectSummary.wallet.did,
        label: projectSummary.wallet.did,
      }),
    ]
  }
}
