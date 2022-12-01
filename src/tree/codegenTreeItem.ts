import { CodegenType } from './codegenTree'
import { BasicTreeItem, BasicTreeItemInput } from './basicTreeItem'

export class CodegenTreeItem extends BasicTreeItem {
  public readonly type: CodegenType

  constructor(
    input: BasicTreeItemInput & {
      type: CodegenType
    },
  ) {
    super(input)
    this.type = input.type
  }
}
