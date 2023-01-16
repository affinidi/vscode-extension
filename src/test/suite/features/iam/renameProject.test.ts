import { expect } from 'chai'
import sinon from 'sinon'
import { window } from 'vscode'
import { iamClient } from '../../../../features/iam/iamClient'
import { iamHelpers } from '../../../../features/iam/iamHelpers'
import { generateProjectId } from '../../helpers'
import { sandbox } from '../../setup'

const input = {
  projectId: generateProjectId(),
  name: 'fake-project-name',
}

describe('renameProject()', () => {
  let renameProject: sinon.SinonStub
  let showInputBox: sinon.SinonStub

  beforeEach(() => {
    showInputBox = sandbox.stub(window, 'showInputBox').resolves(input.name)
    sandbox.stub(iamClient, 'patchProject').resolves()
    renameProject = sandbox.stub(iamHelpers, 'renameProject')
  })

  it('should rename the project with the given ID and new name', async () => {
    await renameProject(input)

    expect(renameProject).calledWith(input)
  })

  it('should prompt the user for the new project name and rename the project', async () => {
    const element = { label: 'fake-project-name', projectId: 'fake-project-id' }
    showInputBox.calledWith({
      prompt: `Enter the new name for the project "${element.label}":`,
    })
    await renameProject(input)
    expect(renameProject).calledWith(input)
  })

  it('should not rename the project if the user cancels the input prompt', async () => {
    showInputBox.rejects(new Error('Input cancelled'))

    expect(renameProject).not.called
  })
})
