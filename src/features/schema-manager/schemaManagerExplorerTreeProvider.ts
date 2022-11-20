import { l10n, ThemeIcon, TreeItemCollapsibleState } from 'vscode'
import { TreeProvider } from '../../shared/treeProvider'
import { AffResourceTreeItem } from '../../treeView/treeItem'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'
import { projectsState } from '../iam/projectsState'
import { schemaManagerClient } from './schemaManagerClient'

export class SchemaManagerExplorerTreeProvider implements TreeProvider<AffResourceTreeItem> {
  async getChildren(
    element: AffResourceTreeItem | undefined,
  ): Promise<AffResourceTreeItem[] | undefined> {
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

  private getRootSchemaItems(parent?: AffResourceTreeItem) {
    return [
      new AffResourceTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: l10n.t('Public'),
        metadata: {
          scope: 'public',
        },
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new AffResourceTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: l10n.t('Unlisted'),
        metadata: {
          scope: 'unlisted',
        },
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getSchemaItems(parent?: AffResourceTreeItem) {
    const {
      wallet: { did },
      apiKey: { apiKeyHash },
    } = projectsState.getProjectById(parent?.projectId)

    const { schemas } = await schemaManagerClient.searchSchemas(
      {
        did,
        authorDid: did,
        scope: parent?.metadata?.scope,
      },
      { apiKeyHash },
    )

    return schemas.map(
      (schema) =>
        new AffResourceTreeItem({
          resourceType: ExplorerResourceTypes.schema,
          label: `${schema.type}V${schema.version}-${schema.revision}`,
          description: schema.description || '',
          metadata: schema,
          icon: new ThemeIcon('bracket'),
          projectId: parent?.projectId,
          command: {
            title: l10n.t('Open schema details'),
            command: 'schema.viewSchemaDetails',
          },
        }),
    )
  }
}
