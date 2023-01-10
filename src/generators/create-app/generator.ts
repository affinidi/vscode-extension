import path from 'path'
import { ProgressLocation, window, Uri } from 'vscode'
import { configVault } from '../../config/configVault'
import { generatorMessage, labels } from '../messages'
import { cliHelper } from '../../utils/cliHelper'
import { notifyError } from '../../utils/notifyError'

export async function generateAffinidiAppWithCLI(): Promise<void> {
  try {
    const isCLIInstalled = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: generatorMessage.checkCliInstall,
      },
      async () => {
        return cliHelper.isCliInstalledOrWarn({ type: 'error' })
      },
    )

    if (!isCLIInstalled) {
      return
    }

    const projectId = await configVault.requireActiveProjectId()
    if (!projectId) {
      return
    }

    const selectedFolder = await window.showOpenDialog({
      canSelectMany: false,
      openLabel: labels.select,
      canSelectFiles: false,
      canSelectFolders: true,
    })

    if (!selectedFolder || (selectedFolder && !selectedFolder.length)) {
      window.showErrorMessage(generatorMessage.noDirectorySelected)
      return
    }

    const { fsPath: folderPath } = Uri.parse(selectedFolder[0].toString())

    const appName = await window.showInputBox({
      prompt: generatorMessage.enterAppName,
    })

    if (!appName) {
      window.showErrorMessage(generatorMessage.appNameNotSelected)
      return
    }

    const fullPath = path.join(folderPath, appName)

    await cliHelper.setActiveProject(projectId)
    await cliHelper.generateApp({ path: fullPath })
  } catch (error: unknown) {
    notifyError(error, generatorMessage.failedToGenerateApp)
  }
}
