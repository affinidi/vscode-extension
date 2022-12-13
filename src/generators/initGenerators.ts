import { commands } from 'vscode'
import { ext } from '../extensionVariables'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { generateAffinidiAppWithCLI } from './create-app/generator'

export const initGenerators = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.codegen.app', async () => {
      telemetryHelpers.trackCommand('affinidi.codegen.app')

      await generateAffinidiAppWithCLI()
    }),
  )
}
