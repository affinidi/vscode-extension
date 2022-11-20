/* eslint-disable import/no-mutable-exports */

import type { ExtensionContext, OutputChannel } from 'vscode'
import type { AffinidiAuthenticationProvider } from './auth/authentication-provider/affinidi-authentication-provider'

export namespace ext {
  export let context: ExtensionContext
  export let outputChannel: OutputChannel
  export let authProvider: AffinidiAuthenticationProvider
}
