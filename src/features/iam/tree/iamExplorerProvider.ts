import { ThemeIcon } from 'vscode'
import { configVaultService } from '../../../auth/authentication-provider/configVault'
import { ext } from '../../../extensionVariables'
import { labels } from '../../../messages/messages'
import { BasicTreeItem } from '../../../tree/basicTreeItem'
import { ExplorerProvider } from '../../../tree/explorerTree'
import { Feature } from '../../feature'
import { iamState } from '../iamState'
import { setActiveProject } from '../setActiveProject'
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
          label: labels.createProject,
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
    const currentUserId = configVaultService.getCurrentUserID()
    const activeProjectId = currentUserId
      ? configVaultService.getActiveProjectId(currentUserId)
      : null
    setActiveProject(activeProjectId ?? projects[0].projectId)

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
        label: labels.digitalIdentities,
        icon: new ThemeIcon('lock'),
        projectId: parent.projectId,
      }),
      new ProjectFeatureTreeItem({
        feature: Feature.ISSUANCES,
        label: labels.issuances,
        icon: new ThemeIcon('output'),
        projectId: parent.projectId,
      }),
      new ProjectFeatureTreeItem({
        feature: Feature.SCHEMAS,
        label: labels.schemas,
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
