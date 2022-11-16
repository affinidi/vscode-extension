import { commands } from 'vscode'
import { ext } from '../extensionVariables'
import {
  EventNames,
  EventSubCategory,
  sendEventToAnalytics,
} from '../services/analyticsStreamApiService'
import { generateAffinidiAppWithCLI } from './create-app/generator'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async () => {
      await generateAffinidiAppWithCLI()

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.codegen.app',
        },
      })
    }),
  )
}
