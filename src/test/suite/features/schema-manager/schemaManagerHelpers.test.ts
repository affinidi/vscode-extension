import { window } from 'vscode'
import { expect } from 'chai'
import * as sinon from 'sinon'

import { sandbox } from '../../setup'
import {
  schemaManagerHelpers,
  EXAMPLE_SCHEMA,
} from '../../../../features/schema-manager/schemaManagerHelpers'
import { generateSchema } from '../../testUtils'
import { schemaManagerState } from '../../../../features/schema-manager/schemaManagerState'

describe('schemaManagerHelpers()', () => {
  const projectId = 'fake-project-id'
  const schema = generateSchema()
  let listAuthoredSchemas: sinon.SinonStub
  let showQuickPick: sinon.SinonStub

  beforeEach(() => {
    listAuthoredSchemas = sandbox.stub(schemaManagerState, 'listAuthoredSchemas').resolves([])
    showQuickPick = sandbox.stub(window, 'showQuickPick')
  })

  describe('askForAuthoredSchema()', () => {
    describe('example schema', () => {
      it('should return example schema if no other schemas', async () => {
        const result = await schemaManagerHelpers.askForAuthoredSchema(
          { projectId, includeExample: true },
        )

        expect(result).equal(EXAMPLE_SCHEMA)
      })

      it('should return selected schema', async () => {
        listAuthoredSchemas.resolves([schema])
        showQuickPick.resolves(schema.id)
        const result = await schemaManagerHelpers.askForAuthoredSchema(
          { projectId, includeExample: true },
        )

        expect(result).equal(schema)
      })
    })

    describe('no example schema', () => {
      it('should return undefined if no schemas', async () => {
        const result = await schemaManagerHelpers.askForAuthoredSchema({ projectId })

        expect(result).equal(undefined)
      })

      it(`should return undefined if user didn't select anything`, async () => {
        listAuthoredSchemas.resolves([schema])
        showQuickPick.resolves()
        const result = await schemaManagerHelpers.askForAuthoredSchema({ projectId })

        expect(result).equal(undefined)
      })

      it('should return selected schema', async () => {
        listAuthoredSchemas.resolves([schema])
        showQuickPick.resolves(schema.id)
        const result = await schemaManagerHelpers.askForAuthoredSchema({ projectId })

        expect(result).equal(schema)
      })
    })
  })

  describe('fetchSchemaUrl()', () => {
    it('should return undefined if no schemas', async () => {
      listAuthoredSchemas.resolves([schema])
      showQuickPick.resolves()

      const result = await schemaManagerHelpers.fetchSchemaUrl(projectId)

      expect(result).equal(undefined)
    })

    it('should return jsonSchemaUrl of selected schemas', async () => {
      listAuthoredSchemas.resolves([schema])
      showQuickPick.resolves(schema.id)
      const result = await schemaManagerHelpers.fetchSchemaUrl(projectId)

      expect(result).equal(schema.jsonSchemaUrl)
    })
  })
})
