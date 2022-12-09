import { authentication, commands, window } from 'vscode'
import { expect } from 'chai'
import * as sinon from 'sinon'
import { AUTH_PROVIDER_ID } from '../../../auth/authentication-provider/affinidi-authentication-provider'
import { ext } from '../../../extensionVariables'
import { sandbox } from '../setup'
import { generateSession } from '../helpers'
import { userManagementClient } from '../../../features/user-management/userManagementClient'
import { authHelper } from '../../../auth/authHelper'
import { iamHelpers } from '../../../features/iam/iamHelpers'

describe('initAuthentication()', () => {
  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine')
    sandbox.stub(window, 'showInformationMessage')
  })

  describe('#affinidi.signUp', () => {
    it('should signup', async () => {
      sandbox.stub(authentication, 'getSession')
      sandbox.stub(iamHelpers, 'createDefaultProject')

      sandbox.stub(window, 'showWarningMessage').resolves('Accept' as any)

      await commands.executeCommand('affinidi.signUp')

      expect(authentication.getSession).calledWith(AUTH_PROVIDER_ID, ['signup'], {
        forceNewSession: true,
      })

      expect(iamHelpers.createDefaultProject).called
    })

    it('should fail signup', async () => {
      sandbox.stub(authentication, 'getSession')

      sandbox.stub(window, 'showWarningMessage').resolves('Reject' as any)

      await commands.executeCommand('affinidi.signUp')

      expect(authentication.getSession).not.called
    })
  })

  describe('#affinidi.login', () => {
    it('should login', async () => {
      sandbox.stub(authentication, 'getSession')

      await commands.executeCommand('affinidi.login')

      expect(authentication.getSession).calledWith(AUTH_PROVIDER_ID, ['login'], {
        forceNewSession: true,
      })
    })
  })

  describe('#affinidi.logout', () => {
    let getSessionStub: sinon.SinonStub

    beforeEach(() => {
      getSessionStub = sandbox.stub(authentication, 'getSession')
      sandbox.stub(ext.authProvider, 'handleRemoveSession')
    })

    it('should log out when session is present', async () => {
      const sessionId = 'fake-session-id'
      getSessionStub.resolves(generateSession({ id: sessionId }))

      await commands.executeCommand('affinidi.logout')

      expect(authentication.getSession).calledWith(AUTH_PROVIDER_ID, [], {
        createIfNone: false,
      })

      expect(ext.authProvider.handleRemoveSession).called
    })

    it('should ignore when no session', async () => {
      await commands.executeCommand('affinidi.logout')

      expect(ext.authProvider.handleRemoveSession).not.called
    })
  })

  describe('#affinidi.me', () => {
    it('should get user details', async () => {
      const userId = 'fake-user-id'
      const username = 'fake-username'
      const consoleAuthToken = 'fake-console-auth-token'

      sandbox.stub(authHelper, 'getConsoleAuthToken').resolves(consoleAuthToken)
      sandbox.stub(userManagementClient, 'me').resolves({ userId, username })

      await commands.executeCommand('affinidi.me')

      expect(userManagementClient.me).calledWith({ consoleAuthToken })
    })
  })
})
