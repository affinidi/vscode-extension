import { expect } from 'chai'
import { iamState } from '../../../features/iam/iamState'
import { ProjectTreeItem } from '../../../features/iam/tree/treeItems'
import { issuanceHelpers } from '../../../features/issuance/issuanceHelpers'
import { issuanceState } from '../../../features/issuance/issuanceState'
import { IssuanceTreeItem } from '../../../features/issuance/tree/treeItems'
import { schemaManagerHelpers } from '../../../features/schema-manager/schemaManagerHelpers'
import { schemaManagerState } from '../../../features/schema-manager/schemaManagerState'
import { SchemaTreeItem } from '../../../features/schema-manager/tree/treeItems'
import { showElementProperties } from '../../../features/showElementProperties'
import { readOnlyContentViewer } from '../../../utils/openReadOnlyContent'
import {
  generateIssuance,
  generateProjectId,
  generateProjectSummary,
  generateSchema,
} from '../helpers'
import { sandbox } from '../setup'

describe('showElementProperties()', () => {
  const projectId = generateProjectId()

  let openReadOnlyContent: sinon.SinonStub

  beforeEach(() => {
    openReadOnlyContent = sandbox.stub(readOnlyContentViewer, 'open')
  })

  it('should show project properties', async () => {
    const projectName = 'Fake project'
    const projectSummary = generateProjectSummary({ projectId, projectName })
    const element = new ProjectTreeItem({
      label: 'Fake label',
      projectId,
    })

    sandbox.stub(iamState, 'requireProjectSummary').withArgs(projectId).resolves(projectSummary)

    await showElementProperties(element)

    expect(readOnlyContentViewer.open).calledWith({
      content: projectSummary,
      node: {
        id: projectId,
        label: projectName,
      },
    })
  })

  it('should show schema properties', async () => {
    const schemaId = 'fake-schema-id'
    const schemaName = 'MySchemaV1-0'
    const schema = generateSchema({ id: schemaId })
    const element = new SchemaTreeItem({
      label: 'Fake label',
      projectId,
      schemaId,
    })

    sandbox.stub(schemaManagerHelpers, 'getSchemaName').withArgs(schema).returns(schemaName)
    sandbox
      .stub(schemaManagerState, 'getAuthoredSchemaById')
      .withArgs({ projectId, schemaId })
      .resolves(schema)

    await showElementProperties(element)

    expect(readOnlyContentViewer.open).calledWith({
      content: schema,
      node: {
        id: schemaId,
        label: schemaName,
      },
    })
  })

  it('should show issuance properties', async () => {
    const issuanceId = 'fake-issuance-id'
    const issuanceName = 'MySchemaV1-0 at 2020-01-01 12:00'
    const issuance = generateIssuance({ id: issuanceId })
    const element = new IssuanceTreeItem({
      label: 'Fake label',
      projectId,
      issuanceId,
    })

    sandbox.stub(issuanceHelpers, 'getIssuanceName').withArgs(issuance).returns(issuanceName)
    sandbox
      .stub(issuanceState, 'getIssuanceById')
      .withArgs({ projectId, issuanceId })
      .resolves(issuance)

    await showElementProperties(element)

    expect(readOnlyContentViewer.open).calledWith({
      content: issuance,
      node: {
        id: issuanceId,
        label: issuanceName,
      },
    })
  })
})
