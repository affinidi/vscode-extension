import { expect } from 'chai'
import { window } from 'vscode'
import { ext } from '../../../extensionVariables'

import { notifyError } from '../../../utils/notifyError'
import { sandbox } from '../setup'

describe('notifyError()', () => {
  beforeEach(() => {
    sandbox.stub(window, 'showErrorMessage')
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(ext.outputChannel, 'show')
  })

  it('should call showErrorMessage with provided error message', () => {
    const message = 'test'
    const error = new Error(message)
    const sourceError = 'fake-error-message'

    notifyError(error, sourceError)

    expect(window.showErrorMessage).calledWithMatch(sourceError)
    expect(ext.outputChannel.appendLine).calledWithMatch(sourceError)
    expect(ext.outputChannel.appendLine).calledWithMatch(`${error}`)
  })
})
