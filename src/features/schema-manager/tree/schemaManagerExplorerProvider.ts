import { l10n, ThemeIcon } from 'vscode'
import { BasicTreeItem } from '../../../tree/basicTreeItem'
import { ExplorerProvider } from '../../../tree/explorerTree'
import { Feature } from '../../feature'
import { ProjectFeatureTreeItem } from '../../iam/tree/treeItems'
import { schemaManagerHelpers } from '../schemaManagerHelpers'
import { schemaManagerState } from '../schemaManagerState'
import { SchemaTreeItem, ScopedSchemasTreeItem } from './treeItems'

export class SchemaManagerExplorerProvider implements ExplorerProvider {
  async getChildren(
    element: BasicTreeItem | undefined,
  ): Promise<BasicTreeItem[] | undefined> {
    if (element === undefined) return undefined

    if (element instanceof ProjectFeatureTreeItem && element.feature === Feature.SCHEMAS) {
      return this.getScopedSchemas(element)
    }

    if (element instanceof ScopedSchemasTreeItem) {
      return this.getSchemas(element)
    }

    return undefined
  }

  private getScopedSchemas(parent: ProjectFeatureTreeItem) {
    return [
      new ScopedSchemasTreeItem({
        projectId: parent.projectId,
        label: l10n.t('Public'),
        scope: 'public',
      }),
      new ScopedSchemasTreeItem({
        projectId: parent.projectId,
        label: l10n.t('Unlisted'),
        scope: 'unlisted',
      }),
    ]
  }

  private async getSchemas(parent: ScopedSchemasTreeItem) {
    const schemas = await schemaManagerState.listAuthoredSchemas(
      {
        projectId: parent.projectId,
        scope: parent.scope,
      },
    )

    return schemas.map(
      (schema) =>
        new SchemaTreeItem({
          label: schemaManagerHelpers.getSchemaName(schema),
          description: schema.description || '',
          icon: new ThemeIcon('bracket'),
          schemaId: schema.id,
          projectId: parent.projectId,
          command: {
            title: l10n.t('Open schema details'),
            command: 'schema.showSchemaDetails',
          },
        }),
    )
  }
}
