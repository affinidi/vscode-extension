import { expect } from 'chai'
import { window } from 'vscode'

import { errorMessage } from '../../../messages/messages'
import { notifyError } from '../../../utils/notifyError'
import { sandbox } from '../setup'

describe('notifyError()', () => {
  beforeEach(() => {
    sandbox.stub(window, 'showErrorMessage')
  })

  it('should call showErrorMessage with provided error message', () => {
    const message = 'test'
    const error = new Error(message)

    notifyError(error)

    expect(window.showErrorMessage).calledWith(message)
  })

  it('should call showErrorMessage with with default message if not error instance', () => {
    notifyError('test')

    expect(window.showErrorMessage).calledWith(errorMessage.unexpectedError)
  })
})
