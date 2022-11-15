import { authentication } from 'vscode'
import { apiFetch } from '../../api-client/api-fetch'
import { cookieFetch } from '../../api-client/cookie-fetch'
import { ext } from '../../extensionVariables'

export const USER_MANAGEMENT_API_BASE = 'https://console-user-management.apse1.affinidi.com/api'

type AuthInput = {
  username: string
}

type AuthOutput = {
  token: string
}

const login = async (input: AuthInput): Promise<AuthOutput> => {
  const token = await apiFetch<string>({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/login`,
    method: 'POST',
    requestBody: {
      username: input.username,
    },
  })

  return { token }
}

const signup = async (input: AuthInput): Promise<AuthOutput> => {
  const token = await apiFetch<string>({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/signup`,
    method: 'POST',
    requestBody: {
      username: input.username,
    },
  })

  return { token }
}

type AuthConfirmInput = {
  confirmationCode: string
  token: string
}

type AuthConfirmOutput = {
  cookie: string
}

const loginConfirm = async (input: AuthConfirmInput): Promise<AuthConfirmOutput> => {
  const cookie = await cookieFetch({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/login/confirm`,
    requestBody: {
      confirmationCode: input.confirmationCode,
      token: input.token,
    },
  })

  return { cookie }
}

const signupConfirm = async (input: AuthConfirmInput): Promise<AuthConfirmOutput> => {
  const cookie = await cookieFetch({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/signup/confirm`,
    requestBody: {
      confirmationCode: input.confirmationCode,
      token: input.token,
    },
  })

  return { cookie }
}

type UserDetailsOutput = {
  userId: string
  username: string
}

const getUserDetails = async (): Promise<UserDetailsOutput> => {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  })

  const { userId, username } = await apiFetch<UserDetailsOutput>({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/me`,
    method: 'GET',
    headers: {
      cookie: session.accessToken,
    },
  })

  return { userId, username }
}

export const userManagementClient = {
  login,
  loginConfirm,
  signup,
  signupConfirm,
  getUserDetails,
}
