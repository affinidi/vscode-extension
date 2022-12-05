import { BasicTreeItem, BasicTreeItemInput } from './basicTreeItem'

export type BasicTreeItemWithProjectInput = BasicTreeItemInput & { projectId: string }

export class BasicTreeItemWithProject extends BasicTreeItem {
  public readonly projectId: string

  constructor(input: BasicTreeItemWithProjectInput) {
    super(input)
    this.projectId = input.projectId
  }
}