import { commands } from 'vscode'
import { configVault } from '../config/configVault'
import { ext } from '../extensionVariables'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { generateAffinidiAppWithCLI } from './create-app/generator'
import { labels } from '../tree/messages'
import { DevToolsTreeItem } from '../tree/devToolsTreeItem'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async (element: DevToolsTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.codegen.app')
      ext.outputChannel.appendLine('GENERATINGGGGGGGGGG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      const reffAppName =
        element?.label?.toString() === labels.portableReputation
          ? 'portable-reputation'
          : 'certification-and-verification'
      const userConfig = await configVault.getUserConfig()
      const timeStamp = userConfig?.timeStamp
      await generateAffinidiAppWithCLI(reffAppName)
      ext.outputChannel.appendLine('GENERATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      telemetryHelpers.trackCommand('affinidi.codegen.app.completed', {
        timeTaken: timeStamp ? Math.floor((Date.now() - timeStamp) / 1000) : 0,
        referenceApp: reffAppName,
      })
    }),
  )
}
