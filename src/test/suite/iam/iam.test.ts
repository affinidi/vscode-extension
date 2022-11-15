import { expect } from 'chai'
import * as sinon from 'sinon'
import { window } from 'vscode'

import { sandbox } from '../setup'
import { iamService } from '../../../services/iamService'
import { createProjectProcess } from '../../../iam/iam'

describe('createProjectProcess()', () => {
  const projectName = 'fake-project-name'
  let showInputBoxStub: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(iamService, 'createProject').resolves()

    sandbox.stub(window, 'showInformationMessage')
    showInputBoxStub = sandbox.stub(window, 'showInputBox').resolves(projectName)
  })

  it('should create project', async () => {
    await createProjectProcess()

    expect(iamService.createProject).calledWith(projectName)
  })

  it('should fail when project name is not provided', async () => {
    showInputBoxStub.resolves(undefined)

    expect(createProjectProcess()).to.rejectedWith('Project name is required')
  })
})
