import { window } from 'vscode'
import { ext } from '../extensionVariables'

import { errorMessage } from '../messages/messages'

export function notifyError(error: unknown, failedSourceErrorMessage?: string) {
  window.showErrorMessage(error instanceof Error ? error.message : errorMessage.unexpectedError)

  if (failedSourceErrorMessage) {
    ext.outputChannel.appendLine(failedSourceErrorMessage)
  }
  ext.outputChannel.appendLine(`${error}`)
  ext.outputChannel.show()
}
