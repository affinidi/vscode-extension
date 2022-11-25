import { l10n, TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerProvider } from '../../tree/types'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'
import { projectsState } from '../../states/projectsState'
import { getMySchemas } from './getMySchemas'
import { SchemaExplorerTreeItem } from './schemaExplorerTreeItem'

export class SchemaManagerExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: SchemaExplorerTreeItem | undefined,
  ): Promise<SchemaExplorerTreeItem[] | undefined> {
    if (element === undefined) return undefined

    switch (element?.resourceType) {
      case ExplorerResourceTypes.rootSchemas:
        return this.getRootSchemaItems(element)
      case ExplorerResourceTypes.subRootSchemas:
        return this.getSchemaItems(element)
      default:
        return undefined
    }
  }

  private getRootSchemaItems(parent?: SchemaExplorerTreeItem) {
    return [
      new SchemaExplorerTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: l10n.t('Public'),
        schemaScope: 'public',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new SchemaExplorerTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: l10n.t('Unlisted'),
        schemaScope: 'unlisted',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getSchemaItems(parent?: SchemaExplorerTreeItem) {
    const {
      wallet: { did },
      apiKey: { apiKeyHash },
    } = projectsState.getProjectById(parent?.projectId)

    const schemas = await getMySchemas(
      {
        did,
        scope: parent?.schemaScope,
      },
      { apiKeyHash },
    )

    return schemas.map(
      (schema) =>
        new SchemaExplorerTreeItem({
          resourceType: ExplorerResourceTypes.schema,
          label: `${schema.type}V${schema.version}-${schema.revision}`,
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
