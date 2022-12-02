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
  let showOpenDialog: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(iamState, 'requireProjectSummary').withArgs(projectId).resolves(projectSummary)
    sandbox.stub(issuanceClient, 'getCsvTemplate').resolves(csvTemplate)
    showOpenDialog = sandbox.stub(window, 'showOpenDialog').resolves([{ fsPath: 'fsPathTest' }] as any)

    showTextDocument = sandbox.stub(window, 'showTextDocument')
    openTextDocument = sandbox.stub(workspace, 'openTextDocument')
    askForProjectId = sandbox.stub(iamHelpers, 'askForProjectId')
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
      const anotherProjectId = 'another-project-id'
      askForProjectId.resolves(anotherProjectId)

      showQuickPick.resolves(implementationLabels[CSVImplementation.uploadCsvFile])
      await csvCreationService.initiateIssuanceCsvFlow({ schema })

      showQuickPick.resolves(implementationLabels[CSVImplementation.openCsvTemplate])
      await csvCreationService.initiateIssuanceCsvFlow({ schema })

      expect(uploadCsvFile).calledWith({ projectId: anotherProjectId, schema })
      expect(openCsvTemplate).calledWith({ projectId: anotherProjectId, schema })
    })

    it('should open a CSV template', async () => {
      showQuickPick.resolves(implementationLabels[CSVImplementation.openCsvTemplate])

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(openCsvTemplate).calledWith({ projectId, schema })
    })

    it('should upload a CSV file', async () => {
      showQuickPick.resolves(implementationLabels[CSVImplementation.uploadCsvFile])

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(uploadCsvFile).calledWith({ projectId, schema })
    })

    it('should stop when cancelled', async () => {
      showQuickPick.resolves(undefined)

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(openCsvTemplate).not.called
      expect(uploadCsvFile).not.called
    })
  })
})
