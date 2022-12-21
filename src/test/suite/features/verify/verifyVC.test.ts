import { window } from 'vscode'
import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'
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

  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(verifierClient, 'verifyCredentials').resolves(JSON.parse(vcTemplate))
    showOpenDialog = sandbox
      .stub(window, 'showOpenDialog')
      .resolves([{ fsPath: 'fsPathTest' }] as any)
  })

  describe('verifyAC()', () => {
    beforeEach(() => {
      showOpenDialog.resolves([{ fsPath: 'fsPathTest' }] as any)
      verifyVC = sandbox.stub(verifierClient, 'verifyCredentials').resolves(JSON.parse(vcTemplate))
      sandbox.stub(fs, 'createReadStream')
    })

    it('should return undefined if nothing is selected', async () => {
      verifyVC.resolves(vcTemplate)
      showOpenDialog.resolves(undefined)

      const result = await verifyVC()
      expect(result).equal(undefined)
    })

    it('if it is an invalid VC it should show and error', async () => {
      verifyVC.resolves(invalidVC)

      await verifyVC({ verifiableCredentials: [invalidVC] })
      expect(window.showInformationMessage).calledWithMatch(issuanceMessage.vcNotVerified)
      expect(verifyVC).calledWith(invalidVC)
    })

    it('if it is a valid VC it should pass', async () => {
      verifyVC.resolves(validVC)

      await verifyVC({ verifiableCredentials: [validVC] })
      expect(window.showInformationMessage).calledWithMatch(issuanceMessage.vcVerified)
      expect(verifyVC).calledWith(validVC)
    })

    it('it should throw and error if it fails  ', async () => {
      verifyVC.resolves(vcTemplate)
      verifyVC.throws({ code: 'VIS-1', message: 'messageTest' })

      await verifyVC()

      expect(ext.outputChannel.appendLine).calledWithMatch(issuanceMessage.vcVerificaitonFailed)
    })
  })
})
