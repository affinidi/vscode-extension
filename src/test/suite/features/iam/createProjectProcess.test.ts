import { expect } from 'chai'
import * as sinon from 'sinon'
import { window } from 'vscode'

import { sandbox } from '../../setup'
import { createProjectProcess } from '../../../../features/iam/createProjectProcess'
import { iamClient } from '../../../../features/iam/iamClient'
import { authHelper } from '../../../../auth/authHelper'

describe('createProjectProcess()', () => {
  const projectName = 'fake-project-name'
  const consoleAuthToken = 'fake-console-auth-token'

  let showInputBoxStub: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves(consoleAuthToken)
    sandbox.stub(iamClient, 'createProject').resolves()
    sandbox.stub(window, 'showInformationMessage')

    showInputBoxStub = sandbox.stub(window, 'showInputBox').resolves(projectName)
  })

  it('should create project', async () => {
    await createProjectProcess()

    expect(iamClient.createProject).calledWith({ name: projectName }, { consoleAuthToken })
  })

  it('should fail when project name is not provided', async () => {
    showInputBoxStub.resolves(undefined)

    expect(createProjectProcess()).to.rejectedWith('Project name is required')
  })
})
