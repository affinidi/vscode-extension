import { ThemeIcon } from 'vscode'
import { ExplorerResourceType } from './explorerTree'
import { AffinidiTreeItem, AffinidiTreeItemInput } from './shared/affinidiTreeItem'

export class ExplorerTreeItem extends AffinidiTreeItem {
  public readonly type: ExplorerResourceType

  public readonly projectId: string | undefined

  public readonly schemaId: string | undefined

  public readonly issuanceId: string | undefined

  public readonly schemaScope: 'public' | 'unlisted' | undefined

  constructor(
    input: AffinidiTreeItemInput & {
      type: ExplorerResourceType
      schemaId?: string
      issuanceId?: string
      schemaScope?: 'public' | 'unlisted'
      description?: string
      projectId?: string
    },
  ) {
    super(input)

    this.type = input.type
    this.tooltip = String(input.label)
    this.description = input.description
    this.schemaId = input.schemaId
    this.issuanceId = input.issuanceId
    this.schemaScope = input.schemaScope
    this.iconPath = input.icon ?? ThemeIcon.Folder
    this.contextValue = ExplorerResourceType[input.type]
    this.projectId = input.projectId
  }
}
