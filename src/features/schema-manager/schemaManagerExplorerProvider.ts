import { l10n, TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerProvider } from '../../tree/types'
import { ExplorerResourceTypes } from '../../tree/types'
import { iamState } from '../iam/iamState'
import { schemaManagerHelpers } from './schemaManagerHelpers'

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
        label: l10n.t('Public'),
        schemaScope: 'public',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: l10n.t('Unlisted'),
        schemaScope: 'unlisted',
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getSchemaItems(parent: ExplorerTreeItem) {
    const {
      wallet: { did },
      apiKey: { apiKeyHash },
    } = await iamState.requireProjectSummary(parent.projectId!)

    const schemas = await schemaManagerHelpers.getMySchemas(
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
