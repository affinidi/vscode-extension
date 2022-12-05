import { ThemeIcon, TreeItemCollapsibleState } from 'vscode';
import { BasicTreeItemWithProject, BasicTreeItemWithProjectInput } from '../../../tree/basicTreeItemWithProject';

type SchemaScope = 'public' | 'unlisted'

export class ScopedSchemasTreeItem extends BasicTreeItemWithProject {
  public readonly scope: SchemaScope

  constructor(input: BasicTreeItemWithProjectInput & { scope: SchemaScope }) {
    super({
      contextValue: 'scopedSchemas',
      icon: new ThemeIcon('bracket'),
      state: TreeItemCollapsibleState.Collapsed,
      ...input,
    })

    this.scope = input.scope
  }
}

export class SchemaTreeItem extends BasicTreeItemWithProject {
  public readonly schemaId: string

  constructor(input: BasicTreeItemWithProjectInput & { schemaId: string }) {
    super({
      contextValue: 'schema',
      icon: new ThemeIcon('bracket'),
      ...input,
    })

    this.schemaId = input.schemaId
  }
}
