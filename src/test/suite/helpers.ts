import * as jwt from 'jsonwebtoken'
import { AuthenticationSession } from 'vscode'

export function generateSession(values?: {
  id?: string
  accessToken?: string
}): AuthenticationSession {
  return {
    id: values?.id ?? 'fake-id',
    accessToken: values?.accessToken ?? 'fake-access-token',
    account: {
      id: 'fake-account-id',
      label: 'fake label',
    },
    scopes: [],
  }
}

export function generateConsoleAuthToken(values?: { userId?: string; username?: string }): string {
  return jwt.sign(
    {
      userId: values?.userId ?? 'fake-user-id',
      username: values?.username ?? 'fake-username',
      extra: 'fields',
    },
    Buffer.from('does-not-matter'),
  )
}
