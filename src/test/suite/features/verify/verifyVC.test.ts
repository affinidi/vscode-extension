import { window } from 'vscode'
import { expect } from 'chai'
import sinon from 'sinon'
import { sandbox } from '../../setup'
import { ext } from '../../../../extensionVariables'
import { verifyVCMessage } from '../../../../features/verifier/messages'
import { vcExamples } from './vcExamples'
import { verifierClient } from '../../../../features/verifier/verifierClient'

describe('verifyAVC())', () => {
  const vcTemplate = 'fake-vc-template'
  const { validVC } = vcExamples
  const { invalidVC } = vcExamples

  let showOpenDialog: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine')
    showOpenDialog = sandbox
      .stub(window, 'showOpenDialog')
      .resolves([{ fsPath: 'fsPathTest' }] as any)
  })

  describe('verifyVC()', () => {
    let verifyVC: sinon.SinonStub
    let showInformationMessage: sinon.SinonStub

    beforeEach(() => {
      showInformationMessage = sandbox.stub(window, 'showInformationMessage')
      showOpenDialog.resolves([{ fsPath: 'fsPathTest' }] as any)
      verifyVC = sandbox
        .stub(verifierClient, 'verifyCredentials')
        .resolves(JSON.parse(JSON.stringify(validVC)))
    })

    it('should return undefined if nothing is selected', async () => {
      verifyVC.resolves()
      showOpenDialog.resolves(undefined)

      const result = await verifyVC()
      expect(result).equal(undefined)
    })

    it('if it is an invalid VC it should show and error', async () => {
      verifyVC.resolves(vcTemplate)

      await verifyVC(invalidVC)
      showInformationMessage.resolves(verifyVCMessage.vcNotValid)
      expect(verifyVC).calledWith(invalidVC)
    })

    it('if it is a valid VC it should pass', async () => {
      verifyVC.resolves(vcTemplate)

      await verifyVC(validVC)
      showInformationMessage.resolves(verifyVCMessage.vcValid)
      expect(verifyVC).calledWith(validVC)
    })
  })
})
