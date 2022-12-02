import { window, workspace } from 'vscode'
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as fs from 'fs'

import { sandbox } from '../../setup'
import {
  csvCreationService,
  CSVImplementation,
  CSV_UPLOAD_ERROR,
  implementationLabels,
  ISSUANCE_CREATED_MESSAGE,
} from '../../../../features/issuance/csvCreationService'
import { iamHelpers } from '../../../../features/iam/iamHelpers'
import { projectsState, NO_PROJECT_ERROR_MESSAGE } from '../../../../states/projectsState'
import { issuanceClient } from '../../../../features/issuance/issuanceClient'
import { ext } from '../../../../extensionVariables'
import { generateIssuance, generateProjectSummary, generateSchema } from '../../testUtils'

describe('csvCreationService()', () => {
  const projectId = 'fake-project-id'
  const did = 'fake-did'
  const apiKeyHash = 'fake-api-hash-key'
  const issuance = generateIssuance({ projectId, issuerDid: did })
  const schema = generateSchema()
  const projectSummary = generateProjectSummary({ did, projectId, apiKeyHash })
  let showTextDocument: sinon.SinonStub
  let openTextDocument: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine')
    showTextDocument = sandbox.stub(window, 'showTextDocument')
    openTextDocument = sandbox.stub(workspace, 'openTextDocument')
  })

  afterEach(() => {
    projectsState.clear()
  })

  describe('openCsvTemplate()', () => {
    it('should throw an error if no project with selected id', async () => {
      sandbox.stub(iamHelpers, 'askForProjectId').resolves(undefined)

      try {
        await csvCreationService.openCsvTemplate({ projectId: '', schema })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        expect(e.message).equal(NO_PROJECT_ERROR_MESSAGE)
      }
    })

    it('should return undefined if project id is not provided', async () => {
      sandbox.stub(iamHelpers, 'askForProjectId').resolves(undefined)
      const result = await csvCreationService.openCsvTemplate({ projectId: '', schema })

      expect(result).equal(undefined)
    })

    it('should open text document', async () => {
      const csvTemplate = 'getCsvTemplateTest'
      projectsState.setProject(projectSummary)
      sandbox.stub(iamHelpers, 'askForProjectId').resolves(undefined)
      sandbox.stub(issuanceClient, 'getCsvTemplate').resolves(csvTemplate)
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
      // @ts-ignore
      showOpenDialog = sandbox.stub(window, 'showOpenDialog').resolves([{ fsPath: 'fsPathTest' }])
      createFromCsv = sandbox.stub(issuanceClient, 'createFromCsv').resolves({ issuance })
      sandbox.stub(fs, 'createReadStream')
    })

    it('should return undefined if file not selected', async () => {
      showOpenDialog.resolves(undefined)

      const result = await csvCreationService.uploadCsvFile({ projectId: '', schema })

      expect(result).equal(undefined)
    })

    it('should create issuance', async () => {
      projectsState.setProject(projectSummary)

      await csvCreationService.uploadCsvFile({ projectId, schema })

      expect(ext.outputChannel.appendLine).calledWith(`${ISSUANCE_CREATED_MESSAGE} ${issuance.id}`)
    })

    it('should show an error if some upload error', async () => {
      projectsState.setProject(projectSummary)
      createFromCsv.throws({ code: 'VIS-1', message: 'messageTest' })

      await csvCreationService.uploadCsvFile({ projectId, schema })

      expect(ext.outputChannel.appendLine).calledWithMatch(CSV_UPLOAD_ERROR)
    })
  })

  describe('openCsvTemplate()', () => {
    let showQuickPick: sinon.SinonStub

    beforeEach(() => {
      showQuickPick = sandbox.stub(window, 'showQuickPick')
    })

    it.skip('should open a CSV template', async () => {
      // @ts-ignore
      showQuickPick.resolves(implementationLabels[CSVImplementation.openCsvTemplate])
      const openCsvTemplate = sandbox.stub(csvCreationService, 'openCsvTemplate')

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(openCsvTemplate).calledWith({ projectId, schema })
    })

    it.skip('should upload a CSV file', async () => {
      // @ts-ignore
      showQuickPick.resolves(implementationLabels[CSVImplementation.uploadCsvFile])
      const uploadCsvFile = sandbox.stub(csvCreationService, 'uploadCsvFile')

      await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })

      expect(uploadCsvFile).calledWith({ projectId, schema })
    })

    it('should throw an error', async () => {
      showQuickPick.resolves()

      try {
        await csvCreationService.initiateIssuanceCsvFlow({ projectId, schema })
      } catch (error) {
        // @ts-ignore
        expect(error?.message).contain('unknown value')
      }
    })
  })
})
