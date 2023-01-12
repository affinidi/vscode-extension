import { window } from 'vscode'
import { expect } from 'chai'
import sinon from 'sinon'

import { sandbox } from '../../setup'
import {
  schemaManagerHelpers,
  EXAMPLE_SCHEMA,
} from '../../../../features/schema-manager/schemaManagerHelpers'
import { schemaManagerState } from '../../../../features/schema-manager/schemaManagerState'
import { generateSchema } from '../../helpers'
import { readOnlyContentViewer } from '../../../../utils/openReadOnlyContent'

describe('schemaManagerHelpers()', () => {
  const projectId = 'fake-project-id-schemaManagerHelpers'
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
        const result = await schemaManagerHelpers.askForAuthoredSchema({
          projectId,
          includeExample: true,
        })

        expect(result).equal(EXAMPLE_SCHEMA)
      })

      it('should return selected schema', async () => {
        listAuthoredSchemas.resolves([schema])
        showQuickPick.resolves(schema.id)
        const result = await schemaManagerHelpers.askForAuthoredSchema({
          projectId,
          includeExample: true,
        })

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

  describe('showSchemaFile()', () => {
    const schema = generateSchema()
    const schemaName = 'MySchemaV1-0'
    const file = { fake: 'content' }

    let fetch: any

    beforeEach(() => {
      fetch = sinon.stub().resolves({ json: sinon.stub().resolves(file) })

      sandbox.stub(schemaManagerHelpers, 'getSchemaName').withArgs(schema).returns(schemaName)
      sandbox.stub(readOnlyContentViewer, 'open')
    })

    it('should open json schema', async () => {
      await schemaManagerHelpers.showSchemaFile(schema, 'json', fetch)

      expect(fetch).calledOnceWith(schema.jsonSchemaUrl)
      expect(readOnlyContentViewer.open).calledOnceWith({
        content: file,
        fileExtension: '.json',
        node: {
          label: schemaName,
          id: schema.id,
        },
      })
    })

    it('should open jsonld context', async () => {
      await schemaManagerHelpers.showSchemaFile(schema, 'jsonld', fetch)

      expect(fetch).calledOnceWith(schema.jsonLdContextUrl)
      expect(readOnlyContentViewer.open).calledOnceWith({
        content: file,
        fileExtension: '.jsonld',
        node: {
          label: schemaName,
          id: schema.id,
        },
      })
    })
  })
})
