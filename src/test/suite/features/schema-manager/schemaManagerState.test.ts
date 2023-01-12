import { expect } from 'chai'
import { iamState } from '../../../../features/iam/iamState'
import { schemaManagerClient } from '../../../../features/schema-manager/schemaManagerClient'
import { SchemaManagerState } from '../../../../features/schema-manager/schemaManagerState'
import { generateProjectId, generateProjectSummary } from '../../helpers'
import { sandbox } from '../../setup'

describe('SchemaManagerState', () => {
  const projectId = generateProjectId()
  const projectSummary = generateProjectSummary({ projectId })
  const schemas: any[] = [
    { id: 'fake-schema-1', namespace: null },
    { id: 'fake-schema-2', namespace: 'fake-namespace' },
    { id: 'fake-schema-3', namespace: null },
    { id: 'fake-schema-4', namespace: 'fake-namespace' },
  ]

  let schemaManagerState: SchemaManagerState

  beforeEach(async () => {
    sandbox.stub(iamState, 'requireProjectSummary').resolves(projectSummary)
    sandbox.stub(schemaManagerClient, 'searchSchemas').resolves({ schemas, count: 4 })

    schemaManagerState = new SchemaManagerState()
  })

  describe('listAuthoredSchemas()', () => {
    it('should fetch schemas once and then reuse the cached value', async () => {
      const [schema1, schema2, schema3, schema4] = schemas

      await expect(schemaManagerState.listAuthoredSchemas({ projectId })).to.eventually.deep.eq(
        schemas,
      )
      await expect(
        schemaManagerState.listAuthoredSchemas({ projectId, scope: 'default' }),
      ).to.eventually.deep.eq(schemas)
      await expect(
        schemaManagerState.listAuthoredSchemas({ projectId, scope: 'public' }),
      ).to.eventually.deep.eq([schema1, schema3])
      await expect(
        schemaManagerState.listAuthoredSchemas({ projectId, scope: 'unlisted' }),
      ).to.eventually.deep.eq([schema2, schema4])

      expect(schemaManagerClient.searchSchemas).calledOnce

      schemaManagerState.clear()

      await expect(schemaManagerState.listAuthoredSchemas({ projectId })).to.eventually.deep.eq(
        schemas,
      )

      expect(schemaManagerClient.searchSchemas).calledTwice

      schemaManagerState.clear()
    })
  })

  describe('getAuthoredSchemaById()', () => {
    it('should fetch schemas once and then reuse the cached value', async () => {
      const [schema1, schema2, schema3, schema4] = schemas

      await expect(
        schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: 'fake-schema-1' }),
      ).to.eventually.deep.eq(schema1)
      await expect(
        schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: 'fake-schema-2' }),
      ).to.eventually.deep.eq(schema2)
      await expect(
        schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: 'fake-schema-3' }),
      ).to.eventually.deep.eq(schema3)

      expect(schemaManagerClient.searchSchemas).calledOnce

      schemaManagerState.clear()

      await expect(
        schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: 'fake-schema-2' }),
      ).to.eventually.deep.eq(schema2)
      await expect(
        schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: 'fake-schema-3' }),
      ).to.eventually.deep.eq(schema3)
      await expect(
        schemaManagerState.getAuthoredSchemaById({ projectId, schemaId: 'fake-schema-4' }),
      ).to.eventually.deep.eq(schema4)

      expect(schemaManagerClient.searchSchemas).calledTwice

      schemaManagerState.clear()
    })
  })
})
