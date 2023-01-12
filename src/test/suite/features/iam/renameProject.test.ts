import { expect } from 'chai'
import sinon from 'sinon'
import { window } from 'vscode'
import { iamClient } from '../../../../features/iam/iamClient'
import { renameProjectService } from '../../../../features/iam/renameProjects'

import { sandbox } from '../../setup'

const input = {
  projectId: 'fake-project-id',
  name: 'fake-project-name',
}

describe('renameProject()', () => {
  let renameProject: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(iamClient, 'patchProject').resolves()
    renameProject = sandbox.stub(renameProjectService, 'renameProject')
  })

  it('should rename the project with the given ID and new name', async () => {
    await renameProject(input)

    expect(renameProject).calledWith(input)
  })
})

describe('activateRenameProject()', () => {
  let showInputBox: sinon.SinonStub
  let renameProject: sinon.SinonStub
  let activateRenameProject: sinon.SinonStub

  beforeEach(() => {
    showInputBox = sandbox.stub(window, 'showInputBox').resolves(input.name)
    renameProject = sandbox.stub(renameProjectService, 'renameProject')
    activateRenameProject = sandbox.stub(renameProjectService, 'activateRenameProject')
  })

  it('should prompt the user for the new project name and rename the project', async () => {
    const element = { label: 'fake-project-name', projectId: 'fake-project-id' }
    await activateRenameProject(element)

    showInputBox.calledWith({
      prompt: `Enter the new name for the project "${element.label}":`,
    })

    await renameProject(element.projectId, input.name)

    expect(renameProject).calledWith(element.projectId, input.name)
  })

  it('should not rename the project if the user cancels the input prompt', async () => {
    showInputBox.rejects(new Error('Input cancelled'))
    const element = { label: 'fake-project-name', projectId: 'fake-project-id' }

    await activateRenameProject(element)
    expect(renameProject).not.called
  })
})
