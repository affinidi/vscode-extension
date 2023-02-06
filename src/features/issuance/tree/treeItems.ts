import { ThemeIcon } from 'vscode'
import {
  BasicTreeItemWithProject,
  BasicTreeItemWithProjectInput,
} from '../../../tree/basicTreeItemWithProject'

export class IssuanceTreeItem extends BasicTreeItemWithProject {
  public readonly issuanceId: string

  constructor(input: BasicTreeItemWithProjectInput & { issuanceId: string }) {
    super({
      contextValue: 'issuance',
      icon: new ThemeIcon('output'),
      ...input,
    })

    this.issuanceId = input.issuanceId
  }
}
