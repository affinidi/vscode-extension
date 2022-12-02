import { expect } from 'chai'
import * as sinon from 'sinon'
import { iamState } from '../../../features/iam/iamState'
import { issuanceState } from '../../../features/issuance/issuanceState'
import { schemaManagerState } from '../../../features/schema-manager/schemaManagerState'

import { viewProperties } from '../../../services/viewDataService'
import { ExplorerResourceTypes } from '../../../tree/types'
import * as openers from '../../../utils/openReadOnlyContent'
import { sandbox } from '../setup'
import { generateIssuance, generateProjectSummary, generateSchema } from '../testUtils'

describe('viewDataService', () => {
  describe('viewProperties()', () => {
    const projectId = 'fake-project-id'
    let openReadOnlyContent: sinon.SinonStub

    beforeEach(() => {
      openReadOnlyContent = sandbox.stub(openers, 'openReadOnlyContent')
    })

    it('should call openReadOnlyContent with project args', async () => {
      const projectSummary = generateProjectSummary({
        projectId,
        projectName: 'fake-project-name',
      })
      sandbox.stub(iamState, 'requireProjectSummary').withArgs(projectId).resolves(projectSummary)

      await viewProperties({ resourceType: ExplorerResourceTypes.project, projectId })

      expect(openReadOnlyContent).calledWith({
        node: { label: projectSummary.project.name, id: projectId },
        content: projectSummary,
      })
    })

    it('should call openReadOnlyContent with schema args', async () => {
      const schema = generateSchema()
      sandbox
        .stub(schemaManagerState, 'getAuthoredSchemaById')
        .withArgs({ projectId, schemaId: schema.id })
        .resolves(schema)

      await viewProperties({
        projectId,
        resourceType: ExplorerResourceTypes.schema,
        schemaId: schema.id,
      })

      expect(openReadOnlyContent).calledWith({
        node: { label: schema.id, id: schema.id },
        content: schema,
      })
    })

    it('should call openReadOnlyContent with issuance args', async () => {
      const issuance = generateIssuance({ projectId })
      sandbox
        .stub(issuanceState, 'getIssuanceById')
        .withArgs({ projectId, issuanceId: issuance.id })
        .resolves(issuance)

      await viewProperties({
        projectId,
        resourceType: ExplorerResourceTypes.issuance,
        issuanceId: issuance.id,
      })

      expect(openReadOnlyContent).calledWith({
        node: { label: issuance.id, id: issuance.id },
        content: issuance,
      })
    })

    it('should throw an error for other resourceType', async () => {
      const issuance = generateIssuance({ projectId })
      sandbox
        .stub(issuanceState, 'getIssuanceById')
        .withArgs({ projectId, issuanceId: issuance.id })
        .resolves(issuance)

      try {
        await viewProperties({
          projectId,
          resourceType: ExplorerResourceTypes.rootIssuance,
          issuanceId: issuance.id,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.message).include('Unexpected resource type')
      }
    })
  })
})
