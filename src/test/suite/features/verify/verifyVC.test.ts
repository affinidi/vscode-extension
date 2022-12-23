import { window } from 'vscode'
import { expect } from 'chai'
import sinon from 'sinon'
import { sandbox } from '../../setup'
import { ext } from '../../../../extensionVariables'
import { issuanceMessage } from '../../../../messages/messages'
import { vcExamples } from './vcExamples'
import { verifierClient } from '../../../../features/verify/verifyClient'

describe('verifyVC())', () => {
  const vcTemplate = 'fake-vc-template'
  const { validVC } = vcExamples
  const { invalidVC } = vcExamples

  let showOpenDialog: sinon.SinonStub
  let verifyVC: sinon.SinonStub
  let showInformationMessage: sinon.SinonStub

  beforeEach(() => {
    showInformationMessage = sandbox.stub(window, 'showInformationMessage')
    sandbox.stub(ext.outputChannel, 'appendLine')
    showOpenDialog = sandbox
      .stub(window, 'showOpenDialog')
      .resolves([{ fsPath: 'fsPathTest' }] as any)
  })

  describe('verifyAC()', () => {
    beforeEach(() => {
      showOpenDialog.resolves([{ fsPath: 'fsPathTest' }] as any)
      verifyVC = sandbox
        .stub(verifierClient, 'verifyCredentials')
        .resolves(JSON.parse(JSON.stringify(vcTemplate)))
    })

    it('should return undefined if nothing is selected', async () => {
      verifyVC.resolves()
      showOpenDialog.resolves(undefined)

      const result = await verifyVC()
      expect(result).equal(undefined)
    })

    it('if it is an invalid VC it should show and error', async () => {
      verifyVC.resolves(invalidVC)

      await verifyVC({ verifiableCredentials: [invalidVC] })
      expect(showInformationMessage).calledWith(issuanceMessage.vcNotValid)
      expect(verifyVC).calledWith(invalidVC)
    })

    it('if it is a valid VC it should pass', async () => {
      verifyVC.resolves(validVC)

      await verifyVC({ verifiableCredentials: [validVC] })
      expect(showInformationMessage).calledWith(issuanceMessage.vcValid)
      expect(verifyVC).calledWith(validVC)
    })

    it('it should throw and error if it fails', async () => {
      verifyVC.resolves(vcTemplate)
      verifyVC.throws({ code: 'VIS-1', message: 'messageTest' })

      await verifyVC()

      expect(ext.outputChannel.appendLine).calledWithMatch(issuanceMessage.vcVerificaitonFailed)
    })
  })
})
