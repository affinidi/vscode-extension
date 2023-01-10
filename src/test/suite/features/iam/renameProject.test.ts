import { expect } from 'chai'
import sinon from 'sinon'
import { window } from 'vscode'
import { activateRenameProject, renameProject } from '../../../../features/iam/renameProjects'

import { sandbox } from '../../setup'

const projectId = 'fake-project-id'
const newName = 'fake-project-name'

describe('renameProject()', () => {
  beforeEach(() => {
    sandbox.stub(renameProject, 'renameProject').resolves()
  })

  it('should rename the project with the given ID and new name', async () => {
    await renameProject(projectId, newName)

    expect(renameProject.renameProject).calledWith(projectId, newName)
  })
})

describe('activateRenameProject()', () => {
  let showInputBoxStub: sinon.SinonStub

  beforeEach(() => {
    showInputBoxStub = sandbox.stub(window, 'showInputBox').resolves(newName)
  })

  it('should prompt the user for the new project name and rename the project', async () => {
    const element = { label: 'fake-project-name', projectId }

    await activateRenameProject(element)

    expect(showInputBoxStub).calledWith({
      prompt: `Enter the new name for the project "${element.label}":`,
      value: element.label,
    })
    expect(renameProject.renameProject).calledWith(element.projectId, newName)
  })

  it('should not rename the project if the user cancels the input prompt', async () => {
    showInputBoxStub.rejects(new Error('Input cancelled'))
    const element = { label: 'fake-project-name', projectId }

    await activateRenameProject(element)
    expect(renameProject.renameProject).not.called
  })
})
