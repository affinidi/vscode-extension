import { expect } from 'chai'
import * as sinon from 'sinon'
import { window } from 'vscode'
import { sandbox } from '../../setup'
import { executeAuthProcess } from '../../../../auth/authentication-provider/auth-process'
import { generateConsoleAuthToken } from '../../helpers'
import { userManagementClient } from '../../../../features/user-management/userManagementClient'

describe('executeAuthProcess()', () => {
  const userId = 'fake-user-id'
  const username = 'fake-username'
  const email = 'fake@example.com'
  const loginToken = 'fake-login-token'
  const signupToken = 'fake-singup-token'
  const confirmationCode = 'fake-confirmation-code'
  const consoleAuthToken = generateConsoleAuthToken({ userId, username })

  let showInputBoxStub: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(userManagementClient, 'login').resolves({ token: loginToken })
    sandbox.stub(userManagementClient, 'confirmLogin').resolves({ consoleAuthToken })
    sandbox.stub(userManagementClient, 'signup').resolves({ token: signupToken })
    sandbox.stub(userManagementClient, 'confirmSignup').resolves({ consoleAuthToken })

    sandbox.stub(window, 'showInformationMessage')
    showInputBoxStub = sandbox
      .stub(window, 'showInputBox')
      .onFirstCall()
      .resolves(email)
      .onSecondCall()
      .resolves(confirmationCode)
  })

  it('should execute a login flow', async () => {
    expect(await executeAuthProcess({ isSignUp: false })).to.deep.eq({
      email,
      id: userId,
      accessToken: `console_authtoken=${consoleAuthToken}`,
    })

    expect(userManagementClient.login).calledWith({ username: email })
    expect(userManagementClient.confirmLogin).calledWith({ confirmationCode, token: loginToken })
  })

  it('should execute a signup flow', async () => {
    expect(await executeAuthProcess({ isSignUp: true })).to.deep.eq({
      email,
      id: userId,
      accessToken: `console_authtoken=${consoleAuthToken}`,
    })

    expect(userManagementClient.signup).calledWith({ username: email })
    expect(userManagementClient.confirmSignup).calledWith({ confirmationCode, token: signupToken })
  })

  it('should fail when email is not provided', async () => {
    showInputBoxStub.onFirstCall().resolves(undefined)

    expect(executeAuthProcess({ isSignUp: false })).to.rejectedWith('Email is required')
  })

  it('should fail when confirmation code is not provided', async () => {
    showInputBoxStub.onSecondCall().resolves(undefined)

    expect(executeAuthProcess({ isSignUp: false })).to.rejectedWith('Confirmation code is required')
  })
})
