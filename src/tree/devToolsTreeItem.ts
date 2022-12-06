import { DevToolsType } from './devToolsTree'
import { BasicTreeItem, BasicTreeItemInput } from './basicTreeItem'

export class DevToolsTreeItem extends BasicTreeItem {
  public readonly type: DevToolsType

  constructor(
    input: BasicTreeItemInput & {
      type: DevToolsType
    },
  ) {
    super(input)
    this.type = input.type
  }
}
