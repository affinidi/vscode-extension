import { VerifyCredentialInput } from '@affinidi/client-verifier/dist/generated/api'
import { ProgressLocation, window } from 'vscode'
import { ext } from '../../extensionVariables'
import { issuanceMessage } from '../../messages/messages'
import { iamState } from '../iam/iamState'
import { verifierClient } from './verifyClient'
import { verifyHelpers } from './verifyHelper'

const exampleCredential = {
  verifiableCredentials: [
    {
      '@context': 'content',
      id: '123',
      type: ['string'],
      holder: null,
      credentialSubject: {
        id: 'string',
      },
      credentialStatus: null,
      issuanceDate: 'string',
      issuer: 'string',
      expirationDate: 'string',
      proof: {
        type: 'string',
        created: 'string',
        verificationMethod: 'string',
        proofPurpose: 'string',
        jws: 'string',
        proofValue: 'string',
        nonce: 'string',
      },
      credentialSchema: {
        type: 'string',
        id: 'string',
      },
    },
  ],
  issuerDidDocument: {
    freeFormObject: 'string',
  },
}

const exampleCredReadbale = JSON.parse(JSON.stringify(exampleCredential, null, 2))
console.log(exampleCredReadbale)

export const verifyAVC = async (input: VerifyCredentialInput) => {
  const { projectId } = await iamState.requireActiveProject()
  console.log('projectId', projectId)

  console.log('called')

  const {
    apiKey: { apiKeyHash },
  } = await iamState.requireProjectSummary(projectId)
  console.log(apiKeyHash)

  const vcInput = input ?? (await verifyHelpers.verifyInput())
  if (!vcInput) return
  console.log(vcInput)

  try {
    const verifiableVC = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: issuanceMessage.vcVerified,
      },
      () => {
        // return verifiableVC
        return verifierClient.verifyCredentials(exampleCredReadbale, { apiKeyHash })
        // check for the response from the verifier
      },
    )

    if (verifiableVC) {
      window.showInformationMessage(issuanceMessage.vcVerified)
      ext.outputChannel.appendLine(issuanceMessage.vcVerified)
      ext.outputChannel.show()
    }
  } catch (error) {
    const verifyError = error.toString()
    window.showInformationMessage(verifyError)
    ext.outputChannel.appendLine(verifyError)
    ext.outputChannel.show()
  }
}
