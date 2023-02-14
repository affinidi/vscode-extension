import { window, Uri, commands } from 'vscode'
import { expect } from 'chai'
import sinon from 'sinon'
import fs from 'fs'
import { sandbox } from '../../setup'
import { ext } from '../../../../extensionVariables'

import { generatorMessage } from '../../../../generators/messages'
import { cliMessage } from '../../../../utils/messages'
import { generateAffinidiAppWithCLI } from '../../../../generators/create-app/generator'
import { configVault } from '../../../../config/configVault'
import { iamState } from '../../../../features/iam/iamState'
import { generateProjectId, generateProjectSummary } from '../../helpers'

const directoryName = '/directory'
const appName = 'appName'
const projectId = generateProjectId()
const projectSummary = generateProjectSummary({ projectId })

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
    dialog = sandbox.stub(window, 'showOpenDialog').resolves([Uri.file(directoryName)])
    existsSync = sandbox.stub(fs, 'existsSync').resolves(true)
    progressWindow = sandbox.stub(window, 'withProgress').resolves(true)
    inputBox = sandbox.stub(window, 'showInputBox').resolves(appName)
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(commands, 'executeCommand')
    sandbox.stub(configVault, 'requireActiveProjectId').resolves(projectId)
    sandbox.stub(iamState, 'requireProjectSummary').resolves(projectSummary)
  })

  it("should show error message if user didn't specify directory", async () => {
    dialog.resolves()

    await generateAffinidiAppWithCLI('ticketing')

    expect(dialog).called
    expect(showErrorMessage).calledWith(generatorMessage.noDirectorySelected)
  })

  it("should show error message if user didn't specify app name", async () => {
    inputBox.resolves()

    await generateAffinidiAppWithCLI('ticketing')

    expect(dialog).called
    expect(showErrorMessage).calledWith(generatorMessage.appNameNotSelected)
  })

  it('should show error message if app with same name already exist in selected path', async () => {
    await generateAffinidiAppWithCLI('ticketing')

    expect(dialog).called
    expect(showErrorMessage).calledWith(generatorMessage.directoryNameDuplication)
  })

  it('should render app with specified params', async () => {
    progressWindow.resolves()
    existsSync.restore()
    existsSync.resolves(false)

    await generateAffinidiAppWithCLI('ticketing')

    expect(dialog).called
    expect(showInformationMessage).calledWith(cliMessage.appGenerated)
    expect(commands.executeCommand).calledWith('vscode.openFolder')
  })
})
