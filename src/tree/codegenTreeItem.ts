import { CodegenType } from './codegenTree'
import { AffinidiTreeItem, AffinidiTreeItemInput } from './shared/affinidiTreeItem'

export class CodegenTreeItem extends AffinidiTreeItem {
  public readonly type: CodegenType

  constructor(
    input: AffinidiTreeItemInput & {
      type: CodegenType
    },
  ) {
    super(input)
    this.type = input.type
  }
}
