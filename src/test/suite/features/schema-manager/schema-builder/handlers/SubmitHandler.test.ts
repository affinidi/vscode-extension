import { expect } from 'chai'
import { nanoid } from 'nanoid'
import { window } from 'vscode'
import { ext } from '../../../../../../extensionVariables'
import { SubmitHandler } from '../../../../../../features/schema-manager/schema-builder/handlers/SubmitHandler'
import {
  BuilderAttribute,
  BuilderSchema,
} from '../../../../../../features/schema-manager/schema-builder/SchemaBuilderWebview'
import * as showSchemaDetails from '../../../../../../features/schema-manager/schema-details/showSchemaDetails'
import { schemasState } from '../../../../../../states/schemasState'
import { sandbox } from '../../../../setup'

function createBuilderAttribute(input?: Partial<BuilderAttribute>): BuilderAttribute {
  return {
    id: input?.id ?? `fake-attribute-id-${nanoid()}`,
    name: input?.name ?? 'fake-attribute',
    description: input?.description ?? 'Fake attribute',
    isRequired: input?.isRequired ?? false,
    type: input?.type ?? 'Text',
  }
}

function createBuilderSchema(input?: Partial<BuilderSchema>): BuilderSchema {
  return {
    type: input?.type ?? 'MySchema',
    description: input?.description ?? '',
    isPublic: input?.isPublic ?? false,
    attributes: input?.attributes ?? [createBuilderAttribute()],
  }
}

describe('handleSubmit()', () => {
  const projectId = 'fake-project-id'

  let handler: SubmitHandler
  let builderSchemaPublisherMock: any
  let webviewMock: any

  beforeEach(() => {
    sandbox.stub(window, 'showErrorMessage')
    sandbox.stub(window, 'showInformationMessage')
    sandbox.stub(ext.explorerTree, 'refresh')
    sandbox.stub(schemasState, 'clear')
    sandbox.stub(showSchemaDetails, 'showSchemaDetails')

    webviewMock = {
      projectId,
      dispose: sandbox.stub(),
      isDisposed: sandbox.stub(),
      sendMessage: sandbox.stub(),
    }

    builderSchemaPublisherMock = {
      publish: sandbox.stub(),
    }

    handler = new SubmitHandler(builderSchemaPublisherMock)
  })

  it('should validate schema type', async () => {
    await handler.handle(webviewMock, { schema: createBuilderSchema({ type: '' }) })
    await handler.handle(webviewMock, { schema: createBuilderSchema({ type: 'A' }) })
    await handler.handle(webviewMock, { schema: createBuilderSchema({ type: 'hello_world' }) })
    await handler.handle(webviewMock, { schema: createBuilderSchema({ type: '!!!' }) })

    expect(window.showErrorMessage).callCount(4)
    expect(webviewMock.sendMessage).calledWith({ command: 'enableSubmit' })
    expect(builderSchemaPublisherMock.publish).not.called
  })

  it('should validate attributes', async () => {
    await handler.handle(webviewMock, { schema: createBuilderSchema({ attributes: [] }) })
    await handler.handle(webviewMock, {
      schema: createBuilderSchema({ attributes: [createBuilderAttribute({ name: '' })] }),
    })
    await handler.handle(webviewMock, {
      schema: createBuilderSchema({ attributes: [createBuilderAttribute({ name: 'hello!' })] }),
    })
    await handler.handle(webviewMock, {
      schema: createBuilderSchema({ attributes: [createBuilderAttribute({ name: '...' })] }),
    })
    await handler.handle(webviewMock, {
      schema: createBuilderSchema({
        attributes: [
          createBuilderAttribute({ name: 'test' }),
          createBuilderAttribute({ name: 'test' }), // duplicate attribute
        ]
      }),
    })

    expect(window.showErrorMessage).callCount(5)
    expect(webviewMock.sendMessage).calledWith({ command: 'enableSubmit' })
    expect(builderSchemaPublisherMock.publish).not.called
  })

  it('should publish the schema', async () => {
    const schema = createBuilderSchema()
    const createdSchema = { fake: 'schema' }

    builderSchemaPublisherMock.publish.resolves(createdSchema)

    await handler.handle(webviewMock, { schema })

    expect(builderSchemaPublisherMock.publish).calledWith(schema, projectId)
    expect(showSchemaDetails.showSchemaDetails).calledWith(createdSchema)
    expect(schemasState.clear).called
    expect(ext.explorerTree.refresh).called
    expect(webviewMock.dispose).called
  })
})
