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

    switch (element?.resourceType) {
      case ExplorerResourceType.rootSchemas:
        return this.getRootSchemaItems(element)
      case ExplorerResourceType.subRootSchemas:
        return this.getSchemaItems(element)
      default:
        return undefined
    }
  }

  private getRootSchemaItems(parent?: ExplorerTreeItem) {
    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceType.subRootSchemas,
        label: l10n.t('Public'),
        schemaScope: 'public',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceType.subRootSchemas,
        label: l10n.t('Unlisted'),
        schemaScope: 'unlisted',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
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
          resourceType: ExplorerResourceType.schema,
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
