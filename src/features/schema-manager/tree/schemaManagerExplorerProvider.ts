import { ThemeIcon } from 'vscode'
import { schemaMessage, labels } from '../messages'
import { BasicTreeItem } from '../../../tree/basicTreeItem'
import { ExplorerProvider } from '../../../tree/explorerTree'
import { Feature } from '../../feature'
import { ProjectFeatureTreeItem } from '../../iam/tree/treeItems'
import { schemaManagerHelpers } from '../schemaManagerHelpers'
import { schemaManagerState } from '../schemaManagerState'
import { SchemaTreeItem, ScopedSchemasTreeItem } from './treeItems'

function simplifySchemaDescription(value: string) {
  return value.replace(/(\n|\r|\t)+/g, ' ')
}

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
        label: labels.public,
        scope: 'public',
      }),
      new ScopedSchemasTreeItem({
        projectId: parent.projectId,
        label: labels.unlisted,
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
          description: simplifySchemaDescription(schema.description || ''),
          icon: new ThemeIcon('bracket'),
          schemaId: schema.id,
          projectId: parent.projectId,
          command: {
            title: schemaMessage.openSchemaDetails,
            command: 'schema.showSchemaDetails',
          },
        }),
    )
  }
}
