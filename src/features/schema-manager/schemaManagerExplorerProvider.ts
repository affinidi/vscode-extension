import { l10n, TreeItemCollapsibleState, ThemeIcon } from 'vscode'
import { ExplorerTreeItem } from '../../tree/explorerTreeItem'
import { ExplorerProvider } from '../../tree/types'
import { ExplorerResourceTypes } from '../../treeView/treeTypes'
import { schemaManagerClient } from './schemaManagerClient'
import { projectsState } from '../../states/projectsState'

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
        metadata: {
          scope: 'public',
        },
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.subRootSchemas,
        label: l10n.t('Unlisted'),
        metadata: {
          scope: 'unlisted',
        },
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        icon: new ThemeIcon('bracket'),
        projectId: parent?.projectId,
      }),
      new ExplorerTreeItem({
        resourceType: ExplorerResourceTypes.project,
        label: l10n.t('Create Schema'),
        icon: new ThemeIcon('file-directory-create'),
        command: {
          title: l10n.t('Create Schema'),
          command: 'affinidiExplorer.createSchema',
        },
        projectId: parent?.projectId,
      }),
    ]
  }

  private async getSchemaItems(parent?: ExplorerTreeItem) {
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
        new ExplorerTreeItem({
          resourceType: ExplorerResourceTypes.schema,
          label: `${schema.type}V${schema.version}-${schema.revision}`,
          description: schema.description || '',
          metadata: schema,
          icon: new ThemeIcon('bracket'),
          projectId: parent?.projectId,
          command: {
            title: l10n.t('Open schema details'),
            command: 'schema.showSchemaDetails',
          },
        }),
    )
  }
}
