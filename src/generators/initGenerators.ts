import { commands } from 'vscode'

import { ext } from '../extensionVariables'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { generateAffinidiAppWithCLI } from './create-app/generator'
import { labels } from '../tree/messages'
import { DevToolsTreeItem } from '../tree/devToolsTreeItem'
import { credentialsVault } from '../config/credentialsVault'
import { UseCasesAppTypes } from '../utils/types'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async (element: DevToolsTreeItem) => {
      telemetryHelpers.trackCommand('affinidi.codegen.app')
      let refAppName: UseCasesAppTypes
      switch (element?.label?.toString()) {
        case labels.educationReferenceApp:
          refAppName = 'education'
          break
        case labels.healthReferenceApp:
          refAppName = 'health'
          break
        case labels.gamingReferenceApp:
          refAppName = `gaming`
          break
        case labels.careerReferenceApp:
          refAppName = `career`
          break
        default:
          refAppName = 'ticketing'
          break
      }

      const timeStamp = credentialsVault.getTimeStamp()
      await generateAffinidiAppWithCLI(refAppName)

      telemetryHelpers.trackCommand('affinidi.codegen.app.completed', {
        timeTaken: timeStamp ? Math.floor((Date.now() - timeStamp) / 1000) : 0,
        referenceApp: refAppName,
      })
    }),
  )
}
