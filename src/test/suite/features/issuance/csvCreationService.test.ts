import { window, workspace } from 'vscode'
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as fs from 'fs'

import { sandbox } from '../../setup'
import {
  csvCreationService,
  CSVImplementation,
  implementationLabels,
} from '../../../../features/issuance/csvCreationService'
import { iamHelpers } from '../../../../features/iam/iamHelpers'
import { issuanceClient } from '../../../../features/issuance/issuanceClient'
import { ext } from '../../../../extensionVariables'
import { generateIssuance, generateProjectSummary, generateSchema } from '../../testUtils'
import { csvMessage } from '../../../../messages/messages'
import { iamState } from '../../../../features/iam/iamState'

describe('csvCreationService()', () => {
  const projectId = 'fake-project-id'
  const did = 'fake-did'
  const apiKeyHash = 'fake-api-hash-key'
  const issuance = generateIssuance({ projectId, issuerDid: did })
  const schema = generateSchema()
  const projectSummary = generateProjectSummary({ did, projectId, apiKeyHash })
  const csvTemplate = 'fake-csv-template'

  let showTextDocument: sinon.SinonStub
  let openTextDocument: sinon.SinonStub
  let askForProjectId: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(iamState, 'requireProjectSummary').withArgs(projectId).resolves(projectSummary)
    sandbox.stub(issuanceClient, 'getCsvTemplate').resolves(csvTemplate)

    showTextDocument = sandbox.stub(window, 'showTextDocument')
    openTextDocument = sandbox.stub(workspace, 'openTextDocument')
    askForProjectId = sandbox.stub(iamHelpers, 'askForProjectId').resolves(projectId)
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

  describe('openCsvTemplate()', () => {
    let showOpenDialog: sinon.SinonStub
    let createFromCsv: sinon.SinonStub

    beforeEach(() => {
      showOpenDialog = sandbox.stub(window, 'showOpenDialog').resolves([{ fsPath: 'fsPathTest' }] as any)
      createFromCsv = sandbox.stub(issuanceClient, 'createFromCsv').resolves({ issuance })
      sandbox.stub(fs, 'createReadStream')
    })

    it('should return undefined if file not selected', async () => {
      showOpenDialog.resolves(undefined)

      const result = await csvCreationService.uploadCsvFile({ projectId: '', schema })

      expect(result).equal(undefined)
    })

    it('should create issuance', async () => {
      await csvCreationService.uploadCsvFile({ projectId, schema })

      expect(ext.outputChannel.appendLine).calledWith(
        `${csvMessage.issuanceCreationMessage} ${issuance.id}`,
      )
    })

    it('should show an error if some upload error', async () => {
      createFromCsv.throws({ code: 'VIS-1', message: 'messageTest' })

      await csvCreationService.uploadCsvFile({ projectId, schema })

      expect(ext.outputChannel.appendLine).calledWithMatch(csvMessage.csvValidationError)
    })
  })

  describe('openCsvTemplate()', () => {
    let showQuickPick: sinon.SinonStub

    beforeEach(() => {
      showQuickPick = sandbox.stub(window, 'showQuickPick')
    })

    it.skip('should open a CSV template', async () => {
      showQuickPick.resolves(implementationLabels[CSVImplementation.openCsvTemplate])
      const openCsvTemplate = sandbox.stub(csvCreationService, 'openCsvTemplate')

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(openCsvTemplate).calledWith({ projectId, schema })
    })

    it.skip('should upload a CSV file', async () => {
      showQuickPick.resolves(implementationLabels[CSVImplementation.uploadCsvFile])
      const uploadCsvFile = sandbox.stub(csvCreationService, 'uploadCsvFile')

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(uploadCsvFile).calledWith({ projectId, schema })
    })

    it('should throw an error', async () => {
      showQuickPick.resolves()

      await expect(csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })).to.be.rejected
    })
  })
})
