import vscode from 'vscode'
import type { AffinidiAuthenticationProvider } from './auth/authentication-provider/affinidi-authentication-provider'
import type { DevToolsTree } from './tree/devToolsTree'
import type { ExplorerTree } from './tree/explorerTree'
import type { FeedbackTree } from './tree/feedbackTree'

export namespace ext {
  export let context: vscode.ExtensionContext
  export let outputChannel: vscode.OutputChannel
  export let authProvider: AffinidiAuthenticationProvider
  export let explorerTree: ExplorerTree
  export let devToolsTree: DevToolsTree
  export let feedbackTree: FeedbackTree
}
