import { l10n, TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerProvider, ExplorerResourceType } from '../../tree/explorerTree'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { schemaManagerHelpers } from './schemaManagerHelpers'
import { schemaManagerState } from './schemaManagerState'

export class SchemaManagerExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: ExplorerTreeItem | undefined,
  ): Promise<ExplorerTreeItem[] | undefined> {
    if (element === undefined) return undefined

    switch (element?.type) {
      case ExplorerResourceType.schemas:
        return this.getRootSchemaItems(element)
      case ExplorerResourceType.scopedSchemas:
        return this.getSchemaItems(element)
      default:
        return undefined
    }
  }

  private getRootSchemaItems(parent?: ExplorerTreeItem) {
    return [
      new ExplorerTreeItem({
        type: ExplorerResourceType.scopedSchemas,
        label: l10n.t('Public'),
        schemaScope: 'public',
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        type: ExplorerResourceType.scopedSchemas,
        label: l10n.t('Unlisted'),
        schemaScope: 'unlisted',
        state: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getSchemaItems(parent: ExplorerTreeItem) {
    const schemas = await schemaManagerState.listAuthoredSchemas(
      {
        projectId: parent.projectId!,
        scope: parent.schemaScope,
      },
    )

    return schemas.map(
      (schema) =>
        new ExplorerTreeItem({
          type: ExplorerResourceType.schema,
          label: schemaManagerHelpers.getSchemaName(schema),
          description: schema.description || '',
          icon: new ThemeIcon('bracket'),
          schemaId: schema.id,
          projectId: parent?.projectId,
          command: {
            title: l10n.t('Open schema details'),
            command: 'schema.showSchemaDetails',
          },
        }),
    )
  }
}
