import { expect } from 'chai'
import * as sinon from 'sinon'
import { window } from 'vscode'
import { sandbox } from '../../setup'
import { executeAuthProcess } from '../../../../auth/authentication-provider/auth-process'
import { generateConsoleAuthCookie } from '../../helpers'
import { userManagementClient } from '../../../../auth/authentication-provider/user-management.client'

describe('executeAuthProcess()', () => {
  const userId = 'fake-user-id'
  const username = 'fake-username'
  const email = 'fake@example.com'
  const loginToken = 'fake-login-token'
  const singupToken = 'fake-singup-token'
  const confirmationCode = 'fake-confirmation-code'
  const cookie = generateConsoleAuthCookie({ userId, username })

  let showInputBoxStub: sinon.SinonStub

  beforeEach(() => {
    sandbox.stub(userManagementClient, 'login').resolves({ token: loginToken })
    sandbox.stub(userManagementClient, 'loginConfirm').resolves({ cookie })
    sandbox.stub(userManagementClient, 'signup').resolves({ token: singupToken })
    sandbox.stub(userManagementClient, 'signupConfirm').resolves({ cookie })

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
      accessToken: cookie,
    })

    expect(userManagementClient.login).calledWith({ username: email })
    expect(userManagementClient.loginConfirm).calledWith({ confirmationCode, token: loginToken })
  })

  it('should execute a signup flow', async () => {
    expect(await executeAuthProcess({ isSignUp: true })).to.deep.eq({
      email,
      id: userId,
      accessToken: cookie,
    })

    expect(userManagementClient.signup).calledWith({ username: email })
    expect(userManagementClient.signupConfirm).calledWith({ confirmationCode, token: singupToken })
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
