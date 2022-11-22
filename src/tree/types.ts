import type { ExplorerTree } from './explorerTree'
import type { ExplorerTreeItem } from './explorerTreeItem'

export interface ExplorerProvider {
  getChildren(
    element: ExplorerTreeItem | undefined,
    context: { tree: ExplorerTree },
  ): Promise<ExplorerTreeItem[] | undefined>
}

export enum ExplorerResourceTypes {
  project,
  rootSchemas,
  subRootSchemas,
  schema,
  rootIssuance,
  issuance,
  rootRules,
  rule,
  rootDID,
  did,
  rootAnalytics,
  empty,
  other,
  login,
  signup,
}
