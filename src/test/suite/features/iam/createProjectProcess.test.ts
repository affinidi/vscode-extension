import { expect } from 'chai'
import sinon from 'sinon'
import { window } from 'vscode'

import { sandbox } from '../../setup'
import { createProjectProcess } from '../../../../features/iam/createProjectProcess'
import { iamClient } from '../../../../features/iam/iamClient'
import { authHelper } from '../../../../auth/authHelper'
import { generateProjectId } from '../../helpers'

describe('createProjectProcess()', () => {
  const projectName = 'fake-project-name'
  const consoleAuthToken = 'fake-console-auth-token'
  const projectId = generateProjectId()

  let showInputBoxStub: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves(consoleAuthToken)
    sandbox.stub(iamClient, 'createProject').resolves({
      projectId,
      createdAt: '',
      name: projectName,
    })
    sandbox.stub(window, 'showInformationMessage')

    showInputBoxStub = sandbox.stub(window, 'showInputBox').resolves(projectName)
  })

  it('should create project', async () => {
    await createProjectProcess()

    expect(iamClient.createProject).calledWith({ name: projectName }, { consoleAuthToken })
  })

  it('should fail when project name is not provided', async () => {
    showInputBoxStub.resolves(undefined)

    expect(await createProjectProcess()).to.be.undefined
    expect(iamClient.createProject).not.called
  })
})
