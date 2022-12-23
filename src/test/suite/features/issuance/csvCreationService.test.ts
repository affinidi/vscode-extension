import { window, workspace } from 'vscode'
import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'

import { sandbox } from '../../setup'
import {
  csvCreationService,
  CSVImplementation,
  implementationLabels,
} from '../../../../features/issuance/csvCreationService'
import { issuanceClient } from '../../../../features/issuance/issuanceClient'
import { ext } from '../../../../extensionVariables'
import { csvMessage } from '../../../../messages/messages'
import { iamState } from '../../../../features/iam/iamState'
import { generateIssuance, generateProjectSummary, generateSchema } from '../../helpers'
import { configVault } from '../../../../config/configVault'
import { iamHelpers } from '../../../../features/iam/iamHelpers'
import { logger } from '../../../../utils/logger'

describe('csvCreationService()', () => {
  const projectId = 'fake-project-id'
  const did = 'fake-did'
  const apiKeyHash = 'fake-api-hash-key'
  const csvTemplate = 'fake-csv-template'
  const walletUrl = 'fake-wallet-url'
  const anotherProjectId = 'another-project-id'
  const issuance = generateIssuance({ projectId, issuerDid: did })
  const schema = generateSchema()
  const projectSummary = generateProjectSummary({ did, projectId, apiKeyHash })

  let showTextDocument: sinon.SinonStub
  let openTextDocument: sinon.SinonStub
  let getActiveProjectId: sinon.SinonStub
  let showOpenDialog: sinon.SinonStub
  let askForWalletUrl: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(ext.outputChannel, 'show')
    sandbox.stub(logger, 'error')
    sandbox.stub(iamState, 'getProjectSummary').withArgs(projectId).resolves(projectSummary)
    sandbox.stub(issuanceClient, 'getCsvTemplate').resolves(csvTemplate)
    showOpenDialog = sandbox
      .stub(window, 'showOpenDialog')
      .resolves([{ fsPath: 'fsPathTest' }] as any)

    showTextDocument = sandbox.stub(window, 'showTextDocument')
    openTextDocument = sandbox.stub(workspace, 'openTextDocument')
    getActiveProjectId = sandbox.stub(configVault, 'getActiveProjectId')
    askForWalletUrl = sandbox.stub(iamHelpers, 'askForWalletUrl')
  })

  describe('openCsvTemplate()', () => {
    it('should open text document', async () => {
      await csvCreationService.openCsvTemplate({ projectId, schema })

      expect(openTextDocument).calledWith({
        language: 'plaintext',
        content: csvTemplate,
      })
      expect(showTextDocument).calledWith(
        openTextDocument({ language: 'plaintext', content: csvTemplate }),
      )
    })
  })

  describe('uploadCsvFile()', () => {
    let createFromCsv: sinon.SinonStub

    beforeEach(() => {
      showOpenDialog.resolves([{ fsPath: 'fsPathTest' }] as any)
      createFromCsv = sandbox.stub(issuanceClient, 'createFromCsv').resolves({ issuance })
      sandbox.stub(fs, 'createReadStream')
    })

    it('should return undefined if file not selected', async () => {
      askForWalletUrl.resolves(walletUrl)
      showOpenDialog.resolves(undefined)

      const result = await csvCreationService.uploadCsvFile({ projectId: '', schema, walletUrl })

      expect(result).equal(undefined)
    })

    it('should create issuance', async () => {
      askForWalletUrl.resolves(walletUrl)
      await csvCreationService.uploadCsvFile({ projectId, schema, walletUrl })

      expect(ext.outputChannel.appendLine).calledWithMatch(csvMessage.issuanceCreationMessage)
    })

    it('should show an error if some upload error', async () => {
      askForWalletUrl.resolves(walletUrl)
      createFromCsv.throws({ code: 'VIS-1', message: 'messageTest' })

      await csvCreationService.uploadCsvFile({ projectId, schema, walletUrl })

      expect(ext.outputChannel.appendLine).calledWithMatch(csvMessage.csvValidationError)
    })
  })

  describe('initiateIssuanceCsvFlow()', () => {
    let openCsvTemplate: sinon.SinonStub
    let uploadCsvFile: sinon.SinonStub
    let showQuickPick: sinon.SinonStub

    beforeEach(() => {
      openCsvTemplate = sandbox.stub(csvCreationService, 'openCsvTemplate')
      uploadCsvFile = sandbox.stub(csvCreationService, 'uploadCsvFile')
      showQuickPick = sandbox.stub(window, 'showQuickPick')
    })

    it('should ask for a project when projectId is not provided', async () => {
      getActiveProjectId.resolves(anotherProjectId)
      askForWalletUrl.resolves(walletUrl)

      showQuickPick.resolves(implementationLabels[CSVImplementation.uploadCsvFile])
      await csvCreationService.initiateIssuanceCsvFlow({ schema, walletUrl })

      showQuickPick.resolves(implementationLabels[CSVImplementation.openCsvTemplate])
      await csvCreationService.initiateIssuanceCsvFlow({ schema })

      expect(uploadCsvFile).calledWith({ projectId: anotherProjectId, schema, walletUrl })
      expect(openCsvTemplate).calledWith({ projectId: anotherProjectId, schema })
    })

    it('should open a CSV template', async () => {
      showQuickPick.resolves(implementationLabels[CSVImplementation.openCsvTemplate])

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(openCsvTemplate).calledWith({ projectId, schema })
    })

    it('should upload a CSV file', async () => {
      showQuickPick.resolves(implementationLabels[CSVImplementation.uploadCsvFile])

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema, walletUrl })

      expect(uploadCsvFile).calledWith({ projectId, schema, walletUrl })
    })

    it('should stop when cancelled', async () => {
      showQuickPick.resolves(undefined)

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(openCsvTemplate).not.called
      expect(uploadCsvFile).not.called
    })
  })
})
