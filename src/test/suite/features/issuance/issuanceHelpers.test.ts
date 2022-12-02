import { window } from 'vscode'
import { expect } from 'chai'
import * as sinon from 'sinon'

import { sandbox } from '../../setup'
import {
  issuanceHelpers,
  NO_ISSUANCES_ERROR_MESSAGE,
} from '../../../../features/issuance/issuanceHelpers'
import { generateIssuance } from '../../testUtils'

describe('issuanceHelpers()', () => {
  const projectId = 'fake-project-id'
  const apiKeyHash = 'fake-api-hash-key'
  const issuance = generateIssuance({ projectId })
  let withProgress: sinon.SinonStub
  let showQuickPick: sinon.SinonStub

  beforeEach(() => {
    withProgress = sandbox.stub(window, 'withProgress').resolves([])
    showQuickPick = sandbox.stub(window, 'showQuickPick')
  })

  describe('askForIssuance()', () => {
    it('should throw an error if no issuances', async () => {
      try {
        await issuanceHelpers.askForIssuance({ projectId })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        expect(e.message).equal(NO_ISSUANCES_ERROR_MESSAGE)
      }
    })

    it('should return selected issuance', async () => {
      withProgress.resolves([issuance])
      showQuickPick.resolves(issuanceHelpers.getIssuanceName(issuance))
      const result = await issuanceHelpers.askForIssuance({ projectId })

      expect(result).equal(issuance)
    })
  })

  describe('askForIssuance()', () => {
    it('should return formatted name', () => {
      expect(issuanceHelpers.getIssuanceName(issuance)).equal('MySchema at 2022-11-30 13:27 (1)')
    })
  })
})
