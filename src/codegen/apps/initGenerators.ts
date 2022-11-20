import { commands } from 'vscode'
import { ext } from '../../extensionVariables'
import {
  EventNames,
  EventSubCategory,
  telemetryClient,
} from '../../features/telemetry/telemetryClient'
import { generateAffinidiAppWithCli } from './generateAffinidiAppWithCli'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async () => {
      await generateAffinidiAppWithCli()

      telemetryClient.sendEvent({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.codegen.app',
        },
      })
    }),
  )
}
