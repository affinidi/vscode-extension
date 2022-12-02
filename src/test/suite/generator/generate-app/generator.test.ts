import { window, Uri, commands } from 'vscode'
import * as path from 'path'
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as fs from 'fs'
import { sandbox } from '../../setup'
import { ext } from '../../../../extensionVariables'

import { cliHelper, buildAppGenerateCommand } from '../../../../utils/cliHelper'
import { cliMessage, generatorMessage } from '../../../../messages/messages'
import { generateAffinidiAppWithCLI } from '../../../../generators/create-app/generator'
import { projectsState } from '../../../../states/projectsState'

const DIRECTORY_NAME = '/directory'
const APP_NAME = 'appName'
const PROJECT_ID = 'fake-project-id'
const PROJECT_SUMMARY = {
  wallet: {
    didUrl: '',
    did: '',
  },
  apiKey: {
    apiKeyHash: '',
    apiKeyName: '',
  },
  project: {
    projectId: PROJECT_ID,
    name: '',
    createdAt: '',
  },
}

describe('generateAffinidiAppWithCLI()', () => {
  let showErrorMessage: sinon.SinonStub
  let showInformationMessage: sinon.SinonStub
  let dialog: any
  let existsSync: any
  let progressWindow: any
  let inputBox: any

  beforeEach(async () => {
    showErrorMessage = sandbox.stub(window, 'showErrorMessage')
    showInformationMessage = sandbox.stub(window, 'showInformationMessage')
    dialog = sandbox.stub(window, 'showOpenDialog').resolves([Uri.file(DIRECTORY_NAME)])
    existsSync = sandbox.stub(fs, 'existsSync').resolves(true)
    progressWindow = sandbox.stub(window, 'withProgress').resolves(true)
    inputBox = sandbox.stub(window, 'showInputBox').resolves(APP_NAME)
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(commands, 'executeCommand')
    sandbox.stub(cliHelper, 'setActiveProject')
    projectsState.setProject(PROJECT_SUMMARY)
  })

  afterEach(() => {
    projectsState.clear()
  })

  it('should show error message when CLI is not installed', async () => {
    progressWindow.resolves(false)

    await generateAffinidiAppWithCLI()

    expect(dialog).not.called
  })

  it("should show error message if user didn't specify directory", async () => {
    dialog.resolves()

    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(showErrorMessage).calledWith(generatorMessage.noDirectorySelected)
  })

  it("should show error message if user didn't specify app name", async () => {
    inputBox.resolves()

    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(showErrorMessage).calledWith(generatorMessage.appNameNotSelected)
  })

  it('should show error message if app with same name already exist in selected path', async () => {
    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(showErrorMessage).calledWith(generatorMessage.directoryNameDuplication)
  })

  it('should render app with specified params', async () => {
    existsSync.restore()
    existsSync.resolves(false)

    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(ext.outputChannel.appendLine).calledWith(
      buildAppGenerateCommand(path.join(DIRECTORY_NAME, APP_NAME)),
    )
    expect(showInformationMessage).calledWith(cliMessage.appGenerated)
    expect(commands.executeCommand).calledWith('vscode.openFolder')
  })
})
