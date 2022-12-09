import { expect } from 'chai'
import { iamState } from '../../../../features/iam/iamState'
import { issuanceClient } from '../../../../features/issuance/issuanceClient'
import { IssuanceState } from '../../../../features/issuance/issuanceState'
import { state } from '../../../../state'
import { sandbox } from '../../setup'

describe('IssuanceState', () => {
  const projectId = 'fake-project-id'
  const issuances: any[] = [{ id: 'fake-issuance-1' }, { id: 'fake-issuance-2' }]

  let issuanceState: IssuanceState

  beforeEach(async () => {
    sandbox
      .stub(iamState, 'requireProjectSummary')
      .resolves({ apiKey: { apiKeyHash: 'fake-api-key-hash' } } as any)
    sandbox.stub(issuanceClient, 'searchIssuances').resolves({ issuances })

    issuanceState = new IssuanceState()

    await state.clear()
  })

  // describe('listIssuances()', () => {
  //   it('should fetch issuances once and then reuse the cached value', async () => {
  //     await expect(issuanceState.listIssuances({ projectId })).to.eventually.deep.eq(issuances)
  //     await expect(issuanceState.listIssuances({ projectId })).to.eventually.deep.eq(issuances)
  //     expect(issuanceClient.searchIssuances).calledOnce

  //     await issuanceState.clear()

  //     await expect(issuanceState.listIssuances({ projectId })).to.eventually.deep.eq(issuances)
  //     expect(issuanceClient.searchIssuances).calledTwice
  //   })
  // })

  describe('getIssuanceById()', () => {
    it('should fetch issuances once and then reuse the cached value', async () => {
      const [issuance1, issuance2] = issuances

      await expect(
        issuanceState.getIssuanceById({ projectId, issuanceId: 'fake-issuance-1' }),
      ).to.eventually.deep.eq(issuance1)
      await expect(
        issuanceState.getIssuanceById({ projectId, issuanceId: 'fake-issuance-2' }),
      ).to.eventually.deep.eq(issuance2)
      expect(issuanceClient.searchIssuances).calledOnce

      await issuanceState.clear()

      await expect(
        issuanceState.getIssuanceById({ projectId, issuanceId: 'fake-issuance-1' }),
      ).to.eventually.deep.eq(issuance1)
      expect(issuanceClient.searchIssuances).calledTwice
    })
  })
})
