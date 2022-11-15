import { window } from 'vscode'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { ext } from '../../../extensionVariables'

import { sandbox } from '../setup'
import { CliHelper, ERROR_MESSAGE, WARNING_MESSAGE } from '../../../utils/cliHelper'

let showWarningMessage: sinon.SinonStub
let showErrorMessage: sinon.SinonStub

describe('CLI installed', () => {
  let cliHelper: CliHelper
  let execMock: any

  beforeEach(async () => {
    execMock = {
      command: sinon.stub(),
    }

    cliHelper = new CliHelper(execMock)

    sandbox.stub(ext.outputChannel, 'appendLine')
    showWarningMessage = sandbox.stub(window, 'showWarningMessage')
    showErrorMessage = sandbox.stub(window, 'showErrorMessage')
  })

  it('should give warning message if CLI is not installed', async () => {
    execMock.command.withArgs('npm list -g').returns({ stdout: '' })

    await cliHelper.isCliInstalledOrWarn({ type: 'warning' })

    expect(ext.outputChannel.appendLine).calledWith(WARNING_MESSAGE)
    expect(showWarningMessage).called
    expect(showErrorMessage).not.called
  })

  it('should give error message if CLI is not installed', async () => {
    execMock.command.withArgs('npm list -g').returns({
      stdout: '',
    })

    await cliHelper.isCliInstalledOrWarn({ type: 'error' })

    expect(ext.outputChannel.appendLine).calledWith(ERROR_MESSAGE)
    expect(showErrorMessage).called
    expect(showWarningMessage).not.called
  })

  it("shouldn't give warning message if CLI is installed", async () => {
    execMock.command.withArgs('npm list -g').returns({
      stdout: '@affinidi/cli',
    })

    await cliHelper.isCliInstalledOrWarn({ type: 'warning' })

    expect(showErrorMessage).not.called
    expect(showWarningMessage).not.called
  })

  it("shouldn't give error message if CLI is installed", async () => {
    execMock.command.withArgs('npm list -g').returns({
      stdout: '@affinidi/cli',
    })

    await cliHelper.isCliInstalledOrWarn({ type: 'error' })

    expect(showErrorMessage).not.called
    expect(showWarningMessage).not.called
  })

  it('should throw error if CLI is not installed', async () => {
    execMock.command.withArgs('npm list -g').returns({
      stdout: '',
    })

    await expect(cliHelper.assertCliIsInstalled()).rejectedWith(ERROR_MESSAGE)

    execMock.command.withArgs('npm list -g').returns({
      stdout: '@affinidi/cli',
    })

    await expect(cliHelper.assertCliIsInstalled()).fulfilled

    expect(showWarningMessage).not.called
    expect(showErrorMessage).not.called
  })
})
