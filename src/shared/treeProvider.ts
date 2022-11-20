import { TreeDataProvider, TreeItem } from 'vscode'

export interface TreeProvider<T extends TreeItem> {
  getChildren(
    element: T | undefined,
    context: { treeDataProvider: TreeDataProvider<T> },
  ): Promise<T[] | undefined>
}
