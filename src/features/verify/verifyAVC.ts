import { VerifyCredentialInput } from '@affinidi/client-verifier/dist/generated/api'
import { ProgressLocation, window } from 'vscode'
import { ext } from '../../extensionVariables'
import { issuanceMessage } from '../../messages/messages'
import { iamState } from '../iam/iamState'
import { verifierClient } from './verifyClient'
import { verifyHelpers } from './verifyHelper'

export const verifyAVC = async (vc?: VerifyCredentialInput) => {
  const { projectId } = await iamState.requireActiveProject()
  const {
    apiKey: { apiKeyHash },
  } = await iamState.requireProjectSummary(projectId)
  const vcInput = vc ?? (await verifyHelpers.verifyInput())
  if (!vcInput) return

  try {
    const data = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: issuanceMessage.vcBeingVerified,
      },
      () => {
        return verifierClient.verifyCredentials({ verifiableCredentials: [vc] }, { apiKeyHash })
      },
    )

    if (data.isValid === true) {
      window.showInformationMessage(issuanceMessage.vcVerified)
      ext.outputChannel.appendLine(JSON.stringify(data, null, 2))
      ext.outputChannel.show()
    }

    if (data.isValid === false) {
      window.showInformationMessage(issuanceMessage.vcNotVerified)
      ext.outputChannel.appendLine(JSON.stringify(data, null, 2))
      ext.outputChannel.show()
    }
  } catch (error: unknown) {
    console.log(error)
  }
}
