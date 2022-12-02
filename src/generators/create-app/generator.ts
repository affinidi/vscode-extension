import * as path from 'path'
import { ProgressLocation, window, Uri, l10n } from 'vscode'
import { ext } from '../../extensionVariables'
import { iamHelpers } from '../../features/iam/iamHelpers'
import { cliHelper } from '../../utils/cliHelper'
import { notifyError } from '../../utils/notifyError'

export const NO_DIRECTORY_SELECTED_MESSAGE = l10n.t("Installation folder wasn't selected.")
export const NO_APP_NAME_SELECTED_MESSAGE = l10n.t("App name wasn't specified.")

export async function generateAffinidiAppWithCLI(): Promise<void> {
  try {
    const isCLIInstalled = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: l10n.t('Checking CLI installation...'),
      },
      async () => {
        return cliHelper.isCliInstalledOrWarn({ type: 'error' })
      },
    )

    if (!isCLIInstalled) {
      return
    }

    const projectId = await iamHelpers.askForProjectId()
    if (!projectId) {
      return
    }

    const selectedFolder = await window.showOpenDialog({
      canSelectMany: false,
      openLabel: l10n.t('Select'),
      canSelectFiles: false,
      canSelectFolders: true,
    })

    if (!selectedFolder || (selectedFolder && !selectedFolder.length)) {
      window.showErrorMessage(NO_DIRECTORY_SELECTED_MESSAGE)
      return
    }

    const { fsPath: folderPath } = Uri.parse(selectedFolder[0].toString())

    const appName = await window.showInputBox({
      prompt: l10n.t('Enter an app name'),
    })

    if (!appName) {
      window.showErrorMessage(NO_APP_NAME_SELECTED_MESSAGE)
      return
    }

    const fullPath = path.join(folderPath, appName)

    await cliHelper.setActiveProject(projectId)
    await cliHelper.generateApp({ path: fullPath })
  } catch (error) {
    ext.outputChannel.appendLine(l10n.t('Failed to generate app'))
    notifyError(error)
  }
}
