import { OpenDialogOptions, ProgressLocation, window } from 'vscode'
import { ext } from '../../extensionVariables'
import { issuanceMessage, labels } from '../../messages/messages'
import { iamState } from '../iam/iamState'
import { verifierClient } from './verifyClient'

export const verifyVC = async () => {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: labels.select,
    canSelectFiles: true,
    canSelectFolders: false,
    filters: {
      'JSON Files': ['JSON'],
    },
  }

  const selectedFiles = await window.showOpenDialog(options)
  const selectedFilePath = selectedFiles?.[0]?.fsPath
  if (!selectedFilePath) {
    return
  }

  const { projectId } = await iamState.requireActiveProject()
  const {
    apiKey: { apiKeyHash },
  } = await iamState.requireProjectSummary(projectId)

  try {
    const data = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: issuanceMessage.vcBeingVerified,
      },
      () => {
        return verifierClient.verifyCredentials(
          { verifiableCredentials: [JSON.parse(selectedFilePath)] },
          { apiKeyHash },
        )
      },
    )

    window.showInformationMessage(
      data.isValid ? issuanceMessage.vcVerified : issuanceMessage.vcNotVerified,
    )
    ext.outputChannel.appendLine(JSON.stringify(data, null, 2))
    ext.outputChannel.show()
  } catch (error: unknown) {
    window.showErrorMessage(issuanceMessage.vcVerificaitonFailed)
    ext.outputChannel.appendLine(JSON.stringify(error))
    ext.outputChannel.show()
  }
}
