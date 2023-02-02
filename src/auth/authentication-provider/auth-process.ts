import { ProgressLocation, window } from 'vscode'
import { authMessage } from '../messages'
import { userManagementClient } from '../../features/user-management/userManagementClient'
import { validateEmail, validateOTP } from './validators'
import { credentialsVault } from '../../config/credentialsVault'
import { telemetryHelpers } from '../../features/telemetry/telemetryHelpers'

type AuthProcessOutput = {
  id: string
  email: string
  accessToken: string
}

export function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

type ExecuteAuthProcessProps = {
  isSignUp: boolean
}

export const executeAuthProcess = async ({
  isSignUp,
}: ExecuteAuthProcessProps): Promise<AuthProcessOutput> => {
  const email = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'email@domain.com',
    prompt: isSignUp ? authMessage.enterEmail : authMessage.enterEmailOfAffinidiAccount,
    validateInput: validateEmail,
  })

  if (!email) {
    throw new Error(authMessage.emailNotFound)
  }

  const { token } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: authMessage.sendingConfirmationCode,
    },
    async () => {
      return isSignUp
        ? userManagementClient.signup({ username: email })
        : userManagementClient.login({ username: email })
    },
  )

  window.showInformationMessage(`${authMessage.confirmationCodeSent} ${email}`)

  const confirmationCode = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: authMessage.confirmationCode,
    prompt: authMessage.pasteEmailAddress,
    validateInput: validateOTP,
  })

  if (!confirmationCode) {
    throw new Error(authMessage.confirmationCodeRequired)
  }

  const { consoleAuthToken } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: authMessage.loggingIn,
    },
    async () => {
      return isSignUp
        ? userManagementClient.confirmSignup({
            confirmationCode,
            token,
          })
        : userManagementClient.confirmLogin({
            confirmationCode,
            token,
          })
    },
  )
  credentialsVault.setTimeStamp()
  if (isSignUp) telemetryHelpers.trackCommand('affinidi.signUp.completed')
  else telemetryHelpers.trackCommand('affinidi.login.completed')
  const { userId } = parseJwt(consoleAuthToken)

  return { email, id: userId, accessToken: consoleAuthToken }
}
