import { TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerProvider } from '../../tree/types'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'
import { projectsState } from '../../states/projectsState'
import { getMySchemas } from './getMySchemas'
import { schemaMessage, labels } from '../../messages/messages'

export class SchemaManagerExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: ExplorerTreeItem | undefined,
  ): Promise<ExplorerTreeItem[] | undefined> {
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

  private getRootSchemaItems(parent?: ExplorerTreeItem) {
    return [
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: `${labels.public}`,
        schemaScope: 'public',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: `${labels.unlisted}`,
        schemaScope: 'unlisted',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getSchemaItems(parent?: ExplorerTreeItem) {
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
        new ExplorerTreeItem({
          resourceType: ExplorerResourceTypes.schema,
          label: `${schema.type}V${schema.version}-${schema.revision}`,
          description: schema.description || '',
          icon: new ThemeIcon('bracket'),
          schemaId: schema.id,
          projectId: parent?.projectId,
          command: {
            title: `${schemaMessage.openSchemaDetails}`,
            command: 'schema.showSchemaDetails',
          },
        }),
    )
  }
}
