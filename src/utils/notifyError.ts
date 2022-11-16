import { window } from 'vscode'

export function notifyError(error: unknown) {
  window.showErrorMessage(error instanceof Error ? error.message : 'Unexpected error')
}
