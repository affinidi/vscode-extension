import { window } from 'vscode'

import { errorMessage } from '../messages/messages'

export function notifyError(error: unknown) {
  window.showErrorMessage(error instanceof Error ? error.message : errorMessage.unexpectedError)
}
