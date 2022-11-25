import { SchemaSearchScope } from '@affinidi/client-schema-manager'
import { Command, TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'

export class SchemaExplorerTreeItem extends ExplorerTreeItem {
  public readonly schemaId: string | undefined

  public readonly schemaScope: SchemaSearchScope | undefined

  constructor(
    public readonly item: {
      resourceType: ExplorerResourceTypes
      label: string
      schemaId?: string
      schemaScope?: SchemaSearchScope
      description?: string
      collapsibleState?: TreeItemCollapsibleState
      icon?: ThemeIcon
      projectId?: string
      command?: Command
    },
  ) {
    super(item)

    this.schemaId = item.schemaId
    this.schemaScope = item.schemaScope
  }
}
