import { commands } from 'vscode'
import { ext } from '../extensionVariables'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { generateAffinidiAppWithCLI } from './create-app/generator'
import { labels } from '../tree/messages'
import { DevToolsTreeItem } from '../tree/devToolsTreeItem'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async (element: DevToolsTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.codegen.app')

      await generateAffinidiAppWithCLI(
        element?.label?.toString() === labels.portableReputation
          ? 'portable-reputation'
          : 'certification-and-verification',
      )
    }),
  )
}
