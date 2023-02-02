import { commands } from 'vscode'

import { ext } from '../extensionVariables'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { generateAffinidiAppWithCLI } from './create-app/generator'
import { labels } from '../tree/messages'
import { DevToolsTreeItem } from '../tree/devToolsTreeItem'
import { credentialsVault } from '../config/credentialsVault'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async (element: DevToolsTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.codegen.app')
      const reffAppName =
        element?.label?.toString() === labels.portableReputation
          ? 'portable-reputation'
          : 'certification-and-verification'

      const timeStamp = credentialsVault.getTimeStamp()
      await generateAffinidiAppWithCLI(reffAppName)

      telemetryHelpers.trackCommand('affinidi.codegen.app.completed', {
        timeTaken: timeStamp ? Math.floor((Date.now() - timeStamp) / 1000) : 0,
        referenceApp: reffAppName,
      })
    }),
  )
}
