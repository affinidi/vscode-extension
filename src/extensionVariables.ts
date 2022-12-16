import vscode from 'vscode'
import { AffinidiAuthenticationProvider } from './auth/authentication-provider/affinidi-authentication-provider'
import { DevToolsTree } from './tree/devToolsTree'
import { ExplorerTree } from './tree/explorerTree'
import { FeedbackTree } from './tree/feedbackTree'

export namespace ext {
  export let context: vscode.ExtensionContext
  export let outputChannel: vscode.OutputChannel
  export let authProvider: AffinidiAuthenticationProvider
  export let explorerTree: ExplorerTree
  export let devToolsTree: DevToolsTree
  export let feedbackTree: FeedbackTree
}
