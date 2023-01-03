import { window } from 'vscode'
import { ext } from '../extensionVariables'
import { genericMessage } from '../messages/messages'
import { logger } from './logger'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyError(error: any, customMessage?: string) {
  const message = customMessage || error?.message || genericMessage.unexpectedError

  logger.error(error, message)
  window.showErrorMessage(genericMessage.errorNotification(message))
  ext.outputChannel.appendLine(`${message}: ${error}`)
  ext.outputChannel.show()
}
