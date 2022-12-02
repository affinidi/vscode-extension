import { expect } from 'chai'
import * as sinon from 'sinon'

import { viewProperties } from '../../../services/viewDataService'
import { issuancesState } from '../../../states/issuancesState'
import { projectsState } from '../../../states/projectsState'
import { schemasState } from '../../../states/schemasState'
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
      projectsState.setProject(projectSummary)

      await viewProperties({ resourceType: ExplorerResourceTypes.project, projectId })

      expect(openReadOnlyContent).calledWith({
        node: { label: projectSummary.project.name, id: projectId },
        content: projectSummary,
      })

      projectsState.clear()
    })

    it('should call openReadOnlyContent with schema args', async () => {
      const schema = generateSchema()
      schemasState.setSchemas([schema])

      await viewProperties({ resourceType: ExplorerResourceTypes.schema, schemaId: schema.id })

      expect(openReadOnlyContent).calledWith({
        node: { label: schema.id, id: schema.id },
        content: schema,
      })

      schemasState.clear()
    })

    it('should call openReadOnlyContent with issuance args', async () => {
      const issuance = generateIssuance({ projectId })
      issuancesState.setIssuances([issuance])

      await viewProperties({
        resourceType: ExplorerResourceTypes.issuance,
        issuanceId: issuance.id,
      })

      expect(openReadOnlyContent).calledWith({
        node: { label: issuance.id, id: issuance.id },
        content: issuance,
      })

      issuancesState.clear()
    })

    it('should throw an error for other resourceType', async () => {
      const issuance = generateIssuance({ projectId })
      issuancesState.setIssuances([issuance])

      try {
        await viewProperties({
          resourceType: ExplorerResourceTypes.rootIssuance,
          issuanceId: issuance.id,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        expect(error.message).include('Unexpected resource type')
      }

      issuancesState.clear()
    })
  })
})
