import { window } from 'vscode'
import { ext } from '../extensionVariables'
import { genericMessage } from '../messages/messages'

export function notifyError(error: unknown, failedSourceErrorMessage: string) {
  window.showErrorMessage(`${failedSourceErrorMessage} ${genericMessage.checkOutputChannel}`)

  ext.outputChannel.appendLine(failedSourceErrorMessage)
  ext.outputChannel.appendLine(`${error}`)
  ext.outputChannel.show()
}
