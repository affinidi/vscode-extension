import { TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { Feature } from '../../feature'
import { BasicTreeItemWithProject, BasicTreeItemWithProjectInput } from '../../../tree/basicTreeItemWithProject'

export class ProjectTreeItem extends BasicTreeItemWithProject {
  constructor(input: BasicTreeItemWithProjectInput) {
    super({
      contextValue: 'project',
      state: TreeItemCollapsibleState.Collapsed,
      icon: new ThemeIcon('project'),
      ...input,
    })
  }
}

export class ProjectFeatureTreeItem extends BasicTreeItemWithProject {
  public readonly feature: Feature

  constructor(input: BasicTreeItemWithProjectInput & { feature: Feature }) {
    super({
      contextValue: input.feature,
      state: TreeItemCollapsibleState.Collapsed,
      ...input,
    })

    this.feature = input.feature
  }
}
export class DigitalIdentityTreeItem extends BasicTreeItemWithProject {
  public readonly did: string

  constructor(
    input: BasicTreeItemWithProjectInput & { did: string },
  ) {
    super({
      contextValue: 'digitalIdentity',
      icon: new ThemeIcon('lock'),
      ...input,
    })

    this.did = input.did
  }
}
