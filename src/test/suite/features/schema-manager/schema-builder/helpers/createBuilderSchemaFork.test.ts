import { expect } from 'chai'
import sinon from 'sinon'
import { vcJsonSchemaFetcher } from '../../../../../../features/issuance/json-schema/json-schema-fetcher'
import { createBuilderSchemaFork } from '../../../../../../features/schema-manager/schema-builder/helpers/createBuilderSchemaFork'
import { BuilderAttribute } from '../../../../../../features/schema-manager/schema-builder/SchemaBuilderWebview'
import { schemaManagerState } from '../../../../../../features/schema-manager/schemaManagerState'
import { generateProjectId, generateSchema } from '../../../../helpers'
import { sandbox } from '../../../../setup'
import jsonSchema from './MySchemaV1-0.json'

describe('createBuilderSchemaFork()', () => {
  it('should create BuilderSchema', async () => {
    const projectId = generateProjectId()
    const description = 'Fake description'
    const schema = generateSchema({ description })

    sandbox
      .stub(schemaManagerState, 'getAuthoredSchemaById')
      .withArgs({ projectId, schemaId: schema.id })
      .resolves(schema)
    sandbox
      .stub(vcJsonSchemaFetcher, 'fetch')
      .withArgs(new URL(schema.jsonSchemaUrl))
      .resolves({ getContent: sinon.stub().returns(jsonSchema) } as any)

    const builderSchema = await createBuilderSchemaFork({
      projectId,
      schemaId: schema.id,
    })

    function getAttribute(name: string): BuilderAttribute {
      const attribute = builderSchema!.attributes.find((a) => a.name === name)!
      expect(attribute).to.exist
      return attribute
    }

    expect(builderSchema).to.deep.equalInAnyOrder({
      parentId: schema.id,
      type: schema.type,
      description,
      isPublic: true,
      attributes: [
        {
          id: getAttribute('name').id,
          parentId: undefined,
          name: 'name',
          description: '',
          isRequired: true,
          type: 'object',
        },
        {
          id: getAttribute('firstName').id,
          parentId: getAttribute('name').id,
          name: 'firstName',
          description: "Person's first name",
          isRequired: true,
          type: 'Text',
        },
        {
          id: getAttribute('lastName').id,
          parentId: getAttribute('name').id,
          name: 'lastName',
          description: "Person's last name",
          isRequired: true,
          type: 'Text',
        },
        {
          id: getAttribute('dateOfBirth').id,
          parentId: undefined,
          name: 'dateOfBirth',
          description: 'Date of birth',
          isRequired: false,
          type: 'Date',
        },
      ],
    })
  })
})
