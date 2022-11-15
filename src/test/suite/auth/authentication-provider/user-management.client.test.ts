import { expect } from 'chai'
import * as nock from 'nock'
import {
  userManagementClient,
  USER_MANAGEMENT_API_BASE,
} from '../../../../auth/authentication-provider/user-management.client'
import { ext } from '../../../../extensionVariables'
import { generateConsoleAuthCookie, generateSession } from '../../helpers'
import { sandbox } from '../../setup'

describe('userManagementClient', () => {
  describe('login()', () => {
    it('should return login token', async () => {
      const token = 'fake-login-token'
      const username = 'fake-username'

      nock(USER_MANAGEMENT_API_BASE)
        .post('/v1/auth/login', { username })
        .reply(200, JSON.stringify(token))

      expect(await userManagementClient.login({ username })).to.deep.eq({
        token,
      })
    })
  })

  describe('loginConfirm()', () => {
    it('should return cookie', async () => {
      const token = 'fake-login-token'
      const confirmationCode = 'fake-confirmation-code'
      const cookie = generateConsoleAuthCookie()

      nock(USER_MANAGEMENT_API_BASE)
        .post('/v1/auth/login/confirm', { token, confirmationCode })
        .reply(200, {}, { 'set-cookie': cookie })

      expect(await userManagementClient.loginConfirm({ token, confirmationCode })).to.deep.eq({
        cookie,
      })
    })
  })

  describe('signup()', () => {
    it('should return signup token', async () => {
      const token = 'fake-signup-token'
      const username = 'fake-username'

      nock(USER_MANAGEMENT_API_BASE)
        .post('/v1/auth/signup', { username })
        .reply(200, JSON.stringify(token))

      expect(await userManagementClient.signup({ username })).to.deep.eq({
        token,
      })
    })
  })

  describe('signupConfirm()', () => {
    it('should return cookie', async () => {
      const token = 'fake-signup-token'
      const confirmationCode = 'fake-confirmation-code'
      const cookie = generateConsoleAuthCookie()

      nock(USER_MANAGEMENT_API_BASE)
        .post('/v1/auth/signup/confirm', { token, confirmationCode })
        .reply(200, {}, { 'set-cookie': cookie })

      expect(await userManagementClient.signupConfirm({ token, confirmationCode })).to.deep.eq({
        cookie,
      })
    })
  })

  describe('getUserDetails()', () => {
    it('should return user details', async () => {
      const userId = 'fake-user-id'
      const username = 'fake-username'
      const cookie = generateConsoleAuthCookie()

      sandbox
        .stub(ext.authProvider, 'requireActiveSession')
        .resolves(generateSession({ accessToken: cookie }))

      nock(USER_MANAGEMENT_API_BASE, {
        reqheaders: {
          cookie,
        },
      })
        .get('/v1/auth/me')
        .reply(200, { userId, username, extra: 'fields' })

      expect(await userManagementClient.getUserDetails()).to.deep.eq({ userId, username })
      expect(ext.authProvider.requireActiveSession).calledWith({ createIfNone: true })
    })
  })
})
