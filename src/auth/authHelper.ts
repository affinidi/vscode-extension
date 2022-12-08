import { ext } from '../extensionVariables'

async function getConsoleAuthToken() {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  })

  return session.accessToken
}

export const authHelper = {
  getConsoleAuthToken,
}
