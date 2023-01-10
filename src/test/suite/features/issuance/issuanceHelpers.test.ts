import { window } from 'vscode'
import { expect } from 'chai'
import sinon from 'sinon'

import { sandbox } from '../../setup'
import { issuanceHelpers } from '../../../../features/issuance/issuanceHelpers'
import { issuanceMessage } from '../../../../features/issuance/messages'
import { generateIssuance } from '../../helpers'

describe('issuanceHelpers()', () => {
  const projectId = 'fake-project-id'
  const issuance = generateIssuance({ projectId })

  let withProgress: sinon.SinonStub
  let showQuickPick: sinon.SinonStub

  beforeEach(() => {
    withProgress = sandbox.stub(window, 'withProgress').resolves([])
    showQuickPick = sandbox.stub(window, 'showQuickPick')
  })

  describe('askForIssuance()', () => {
    it('should throw an error if no issuances', async () => {
      await expect(issuanceHelpers.askForIssuance({ projectId })).to.eventually.be.rejectedWith(
        issuanceMessage.noIssuances,
      )
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
      expect(issuanceHelpers.getIssuanceName(issuance)).equal(
        'MySchema at 2022-11-30 13:27 (fake-issuance-id)',
      )
    })
  })
})
