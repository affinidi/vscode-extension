import { IssuanceDto } from '@affinidi/client-issuance'
import { expect } from 'chai'

import { sandbox } from '../../setup'
import { getIssuances } from '../../../../features/issuance/getIssuances'
import { issuancesState } from '../../../../states/issuancesState'
import { issuanceClient } from '../../../../features/issuance/issuanceClient'
import { EXAMPLE_SCHEMA } from '../../../../features/schema-manager/schemaManagerHelpers'

describe('getIssuances()', () => {
  const projectId = 'fake-project-id'
  const did = 'fake-did'
  const apiKeyHash = 'fake-api-hash-key'
  const issuance: IssuanceDto = {
    id: '1',
    createdAt: '',
    template: {
      verification: {
        method: 'email',
      },
      schema: EXAMPLE_SCHEMA,
      issuerDid: did,
    },
    projectId,
  }

  afterEach(() => {
    issuancesState.clear()
  })

  it('should get issuances from state', async () => {
    issuancesState.setIssuances([issuance])
    const schemas = await getIssuances(projectId, { apiKeyHash })

    expect(schemas).length(1)
    expect(schemas[0].id).equal(issuance.id)
  })

  it('should fetch issuances', async () => {
    issuance.id = '2'
    const searchSchemas = sandbox
      .stub(issuanceClient, 'searchIssuances')
      .resolves({ issuances: [issuance] })
    const issuances = await getIssuances(projectId, { apiKeyHash })

    expect(searchSchemas).calledWith({ projectId }, { apiKeyHash })
    expect(issuances[0].id).equal(issuance.id)
  })
})
