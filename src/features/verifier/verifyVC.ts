import { OpenDialogOptions, ProgressLocation, window } from 'vscode'
import fs from 'fs'
import { ext } from '../../extensionVariables'
import { labels } from '../messages'
import { verifyVCMessage } from './messages'
import { iamState } from '../iam/iamState'
import { verifierClient } from './verifierClient'
import { notifyError } from '../../utils/notifyError'
import { configVault } from '../../config/configVault'

const selectOptions: OpenDialogOptions = {
  canSelectMany: false,
  openLabel: labels.select,
  canSelectFiles: true,
  canSelectFolders: false,
  filters: {
    'JSON Files': ['JSON'],
  },
}

export const verifyVC = async () => {
  const selectedFiles = await window.showOpenDialog(selectOptions)
  const selectedFilePath = selectedFiles?.[0]?.fsPath
  if (!selectedFilePath) return

  const selectedFileData = fs.readFileSync(selectedFilePath)

  const activeProjectId = await configVault.requireActiveProjectId()
  const {
    apiKey: { apiKeyHash },
  } = await iamState.requireProjectSummary(activeProjectId)

  try {
    const data = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: verifyVCMessage.vcBeingVerified,
      },
      async () => {
        return verifierClient.verifyCredentials(
          {
            verifiableCredentials: [JSON.parse(selectedFileData.toString())],
          },
          { apiKeyHash },
        )
      },
    )

    window.showInformationMessage(
      data.isValid ? verifyVCMessage.vcValid : verifyVCMessage.vcNotValid,
    )
    ext.outputChannel.appendLine(JSON.stringify(data, null, 2))
    ext.outputChannel.show()
  } catch (error: unknown) {
    notifyError(error, verifyVCMessage.vcVerificaitonFailed)
    ext.outputChannel.appendLine(JSON.stringify(error, null, 2))
  }
}
