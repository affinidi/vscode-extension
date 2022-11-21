import { window, Uri, commands } from 'vscode'
import * as path from 'path'
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as fs from 'fs'
import { sandbox } from '../../setup'
import { ext } from '../../../../extensionVariables'

import {
  buildAppGenerateCommand,
  DIRECTORY_NAME_DUPLICATION_ERROR_MESSAGE,
  APP_SUCCESSFULLY_CREATED_MESSAGE,
} from '../../../../utils/cliHelper'
import {
  generateAffinidiAppWithCLI,
  NO_DIRECTORY_SELECTED_MESSAGE,
  NO_APP_NAME_SELECTED_MESSAGE,
} from '../../../../generators/create-app/generator'
import { authHelper } from '../../../../auth/authHelper'
import { iamHelper, PROJECT_REQUIRED_ERROR_MESSAGE } from '../../../../features/iam/iamHelper'
import { iamClient } from '../../../../features/iam/iamClient'

const DIRECTORY_NAME = '/directory'
const APP_NAME = 'appName'

describe('generateAffinidiAppWithCLI()', () => {
  let showErrorMessage: sinon.SinonStub
  let showInformationMessage: sinon.SinonStub
  let showWarningMessage: sinon.SinonStub
  let dialog: any
  let existsSync: any
  let progressWindow: any
  let inputBox: any

  beforeEach(async () => {
    showErrorMessage = sandbox.stub(window, 'showErrorMessage')
    showInformationMessage = sandbox.stub(window, 'showInformationMessage')
    showWarningMessage = sandbox.stub(window, 'showWarningMessage')
    dialog = sandbox.stub(window, 'showOpenDialog').resolves([Uri.file(DIRECTORY_NAME)])
    existsSync = sandbox.stub(fs, 'existsSync').resolves(true)
    progressWindow = sandbox.stub(window, 'withProgress').resolves(true)
    inputBox = sandbox.stub(window, 'showInputBox').resolves(APP_NAME)
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(commands, 'executeCommand')
    sandbox.stub(authHelper, 'getConsoleAuthToken').resolves('fake-token')
  })

  it('should show error message when CLI is not installed', async () => {
    sandbox.stub(iamHelper, 'askForProjectId').resolves('fake-projectId')

    progressWindow.resolves(false)

    await generateAffinidiAppWithCLI()

    expect(dialog).not.called
  })

  it("should show error message if user didn't specify directory", async () => {
    sandbox.stub(iamHelper, 'askForProjectId').resolves('fake-projectId')

    dialog.resolves()

    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(showErrorMessage).calledWith(NO_DIRECTORY_SELECTED_MESSAGE)
  })

  it("should show error message if user didn't specify app name", async () => {
    sandbox.stub(iamHelper, 'askForProjectId').resolves('fake-projectId')

    inputBox.resolves()

    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(showErrorMessage).calledWith(NO_APP_NAME_SELECTED_MESSAGE)
  })

  it('should show error message if app with same name already exist in selected path', async () => {
    sandbox.stub(iamHelper, 'askForProjectId').resolves('fake-projectId')

    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(showErrorMessage).calledWith(DIRECTORY_NAME_DUPLICATION_ERROR_MESSAGE)
  })

  it('should show error message when user has no projects', async () => {
    sandbox.stub(iamClient, 'listProjects').resolves({ projects: [] })

    await generateAffinidiAppWithCLI()

    expect(showErrorMessage).calledWith(PROJECT_REQUIRED_ERROR_MESSAGE)
  })

  it('should render app with specified params', async () => {
    sandbox.stub(iamHelper, 'askForProjectId').resolves('fake-projectId')

    existsSync.restore()
    existsSync.resolves(false)

    await generateAffinidiAppWithCLI()

    expect(dialog).called
    expect(ext.outputChannel.appendLine).calledWith(
      buildAppGenerateCommand(path.join(DIRECTORY_NAME, APP_NAME)),
    )
    expect(showInformationMessage).calledWith(APP_SUCCESSFULLY_CREATED_MESSAGE)
    expect(commands.executeCommand).calledWith('vscode.openFolder')
  })
})
