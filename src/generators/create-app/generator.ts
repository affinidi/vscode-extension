import path from 'path'
import { window, Uri } from 'vscode'
import { configVault } from '../../config/configVault'
import { generatorMessage, labels } from '../messages'
import { cliHelper } from '../../utils/cliHelper'
import { notifyError } from '../../utils/notifyError'
import { UseCasesAppTypes } from '../../utils/types'

export async function generateAffinidiAppWithCLI(useCase: UseCasesAppTypes): Promise<void> {
  try {
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

    await cliHelper.generateApp({ path: fullPath, useCase })
  } catch (error: unknown) {
    notifyError(error, generatorMessage.failedToGenerateApp)
  }
}
