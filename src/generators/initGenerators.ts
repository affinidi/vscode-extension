import { commands } from 'vscode'
import { ext } from '../extensionVariables'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { DevToolsTreeItem } from '../tree/devToolsTreeItem'
import { generateAffinidiAppWithCLI } from './create-app/generator'
import { labels } from '../tree/messages'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async (element?: DevToolsTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.codegen.app')

      await generateAffinidiAppWithCLI(
        element?.label === labels.certificationAndVerification
          ? 'certification-and-verification'
          : 'portable-reputation',
      )
    }),
  )
}
