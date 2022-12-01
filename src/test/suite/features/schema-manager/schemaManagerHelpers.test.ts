import { window } from 'vscode'
import { expect } from 'chai'
import * as sinon from 'sinon'

import { sandbox } from '../../setup'
import {
  schemaManagerHelpers,
  EXAMPLE_SCHEMA,
} from '../../../../features/schema-manager/schemaManagerHelpers'
import { projectsState } from '../../../../states/projectsState'
import { schemasState } from '../../../../states/schemasState'
import { schemaManagerClient } from '../../../../features/schema-manager/schemaManagerClient'
import { generateProjectSummary, generateSchema } from '../../testUtils'

describe('schemaManagerHelpers()', () => {
  const projectId = 'fake-project-id'
  const did = 'fake-did'
  const apiKeyHash = 'fake-api-hash-key'
  const schema = generateSchema()
  let withProgress: sinon.SinonStub
  let showQuickPick: sinon.SinonStub

  beforeEach(() => {
    withProgress = sandbox.stub(window, 'withProgress').resolves([])
    showQuickPick = sandbox.stub(window, 'showQuickPick')
  })

  describe('askForMySchema()', () => {
    describe('example schema', () => {
      it('should return example schema if no other schemas', async () => {
        const result = await schemaManagerHelpers.askForMySchema(
          { did, includeExample: true },
          { apiKeyHash },
        )

        expect(result).equal(EXAMPLE_SCHEMA)
      })

      it('should return selected schema', async () => {
        withProgress.resolves([schema])
        showQuickPick.resolves(schema.id)
        const result = await schemaManagerHelpers.askForMySchema(
          { did, includeExample: true },
          { apiKeyHash },
        )

        expect(result).equal(schema)
      })
    })

    describe('no example schema', () => {
      it('should return undefined if no schemas', async () => {
        const result = await schemaManagerHelpers.askForMySchema({ did }, { apiKeyHash })

        expect(result).equal(undefined)
      })

      it(`should return undefined if user didn't select anything`, async () => {
        withProgress.resolves([schema])
        showQuickPick.resolves()
        const result = await schemaManagerHelpers.askForMySchema({ did }, { apiKeyHash })

        expect(result).equal(undefined)
      })

      it('should return selected schema', async () => {
        withProgress.resolves([schema])
        showQuickPick.resolves(schema.id)
        const result = await schemaManagerHelpers.askForMySchema({ did }, { apiKeyHash })

        expect(result).equal(schema)
      })
    })
  })

  describe('fetchSchemaUrl()', () => {
    const projectSummary = generateProjectSummary({ projectId })

    beforeEach(() => {
      projectsState.setProject(projectSummary)
    })

    afterEach(() => {
      projectsState.clear()
    })

    it('should return undefined if no schemas', async () => {
      withProgress.resolves([schema])
      showQuickPick.resolves()

      const result = await schemaManagerHelpers.fetchSchemaUrl(projectId)

      expect(result).equal(undefined)
    })

    it('should return jsonSchemaUrl of selected schemas', async () => {
      withProgress.resolves([schema])
      showQuickPick.resolves(schema.id)
      const result = await schemaManagerHelpers.fetchSchemaUrl(projectId)

      expect(result).equal(schema.jsonSchemaUrl)
    })
  })

  describe('getMySchemas()', () => {
    afterEach(() => {
      schemasState.clear()
    })

    it('should get public schemas from state', async () => {
      schema.type = 'test'
      schemasState.setSchemas([schema])
      const schemas = await schemaManagerHelpers.getMySchemas(
        { did, scope: 'public' },
        { apiKeyHash },
      )

      expect(schemas).length(1)
      expect(schemas[0].namespace).equal(null)
      expect(schemas[0].type).equal('test')
    })

    it('should get unlisted schemas from state', async () => {
      schema.type = 'test1'
      schemasState.setSchemas([schema])
      const schemas = await schemaManagerHelpers.getMySchemas(
        { did, scope: 'public' },
        { apiKeyHash },
      )

      expect(schemas).length(1)
      expect(schemas[0].namespace).equal(null)
      expect(schemas[0].type).equal('test1')
    })

    it('should fetch schemas', async () => {
      schema.type = 'test2'
      const searchSchemas = sandbox
        .stub(schemaManagerClient, 'searchSchemas')
        .resolves({ count: 1, schemas: [schema] })
      const schemas = await schemaManagerHelpers.getMySchemas(
        { did, scope: 'public' },
        { apiKeyHash },
      )

      expect(searchSchemas).calledWith({ did, authorDid: did, scope: 'public' }, { apiKeyHash })
      expect(schemas[0].type).equal('test2')
    })
  })
})
