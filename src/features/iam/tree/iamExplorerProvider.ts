import { ThemeIcon, TreeItemCollapsibleState } from 'vscode'

import { ext } from '../../../extensionVariables'
import { labels, projectMessage } from '../../../messages/messages'
import { BasicTreeItem } from '../../../tree/basicTreeItem'
import { ExplorerProvider } from '../../../tree/explorerTree'
import { logger } from '../../../utils/logger'
import { notifyError } from '../../../utils/notifyError'
import { Feature } from '../../feature'
import { iamState } from '../iamState'

import {
  ProjectTreeItem,
  ProjectFeatureTreeItem,
  DigitalIdentityTreeItem,
  InactiveProjectsFolderTreeItem,
  InactiveProjectTreeItem,
} from './treeItems'

export class IamExplorerProvider implements ExplorerProvider {
  public async getChildren(
    parent: BasicTreeItem | undefined,
  ): Promise<BasicTreeItem[] | undefined> {
    const isLoggedIn = await ext.authProvider.isLoggedIn()
    if (!isLoggedIn) return undefined

    if (parent === undefined) {
      return [
        ...(await this.getProjectItems()),
        new BasicTreeItem({
          label: labels.createProject,
          icon: new ThemeIcon('file-directory-create'),
          command: 'affinidi.createProject',
        }),
      ]
    }

    if (parent instanceof InactiveProjectsFolderTreeItem) {
      const inactiveProjects = await iamState.getInactiveProjects()

      return inactiveProjects.map(
        (project) =>
          new InactiveProjectTreeItem({
            label: project.name,
            projectId: project.projectId,
          }),
      )
    }

    if (parent instanceof ProjectTreeItem) {
      return this.getProjectFeatures(parent)
    }

    if (parent instanceof ProjectFeatureTreeItem && parent.feature === Feature.DIGITAL_IDENTITIES) {
      return this.getDigitalIdentities(parent)
    }

    return undefined
  }

  async getProjectItems() {
    try {
      const projectsCount = (await iamState.listProjects()).length
      if (projectsCount === 0) {
        return []
      }
      const activeProject = await iamState.requireActiveProject()

      const activeProjectTreeItem = new ProjectTreeItem({
        label: activeProject.name,
        projectId: activeProject.projectId,
        state: TreeItemCollapsibleState.Expanded,
        description: labels.activeProject,
      })

      if (projectsCount === 1) {
        return [activeProjectTreeItem]
      }

      return [
        activeProjectTreeItem,
        new InactiveProjectsFolderTreeItem({
          label: labels.inactiveProjects,
          state: TreeItemCollapsibleState.Collapsed,
          icon: new ThemeIcon('folder'),
        }),
      ]
    } catch (error: unknown) {
      logger.error(error, projectMessage.failedToFetchProjects)
      notifyError(error, projectMessage.failedToFetchProjects)
      throw error
    }
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
