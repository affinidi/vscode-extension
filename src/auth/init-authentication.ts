import { authentication, commands, window, ProgressLocation } from 'vscode'
import { ext } from '../extensionVariables'
import { userManagementClient } from '../features/user-management/userManagementClient'
import { authMessage, errorMessage, labels } from '../messages/messages'
import { cliHelper } from '../utils/cliHelper'
import {
  AffinidiAuthenticationProvider,
  AUTH_PROVIDER_ID,
} from './authentication-provider/affinidi-authentication-provider'
import { authHelper } from './authHelper'
import { readOnlyContentViewer } from '../utils/openReadOnlyContent'
import { iamHelpers } from '../features/iam/iamHelpers'
import { telemetryHelpers } from '../features/telemetry/telemetryHelpers'
import { showQuickPick } from '../utils/showQuickPick'

const CONSENT = {
  accept: authMessage.accept,
  reject: authMessage.reject,
}

async function signUpHandler(): Promise<void> {
  telemetryHelpers.trackCommand('affinidi.signUp')

  const selection = await window.showWarningMessage(
    authMessage.termsAndConditions,
    CONSENT.accept,
    CONSENT.reject,
  )

  switch (selection) {
    case CONSENT.accept:
      window.showInformationMessage(authMessage.acceptedTermsAndConditions)

      await authentication.getSession(AUTH_PROVIDER_ID, ['signup'], {
        forceNewSession: true,
      })

      window.showInformationMessage(authMessage.signedUp)
      ext.outputChannel.appendLine(authMessage.signedUp)

      await iamHelpers.createDefaultProject()

      await cliHelper.isCliInstalledOrWarn({ type: 'warning' })
      break

    case CONSENT.reject:
      window.showInformationMessage(authMessage.rejectedTermsAndConditions)
      break
    default:
      throw new Error(`${errorMessage.unknownSelection} ${selection}`)
  }
}

async function loginHandler(): Promise<void> {
  telemetryHelpers.trackCommand('affinidi.login')

  await authentication.getSession(AUTH_PROVIDER_ID, ['login'], {
    forceNewSession: true,
  })

  window.showInformationMessage(authMessage.loggedIn)
  ext.outputChannel.appendLine(authMessage.loggedIn)
  await cliHelper.isCliInstalledOrWarn({ type: 'warning' })
}

async function logoutHandler(): Promise<void> {
  telemetryHelpers.trackCommand('affinidi.logout')

  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: false,
  })

  if (session) {
    ext.authProvider.handleRemoveSession()

    await window.showInformationMessage(authMessage.loggedOut)
    ext.outputChannel.appendLine(authMessage.loggedOut)
  } else {
    await window.showInformationMessage(authMessage.notLoggedIn)
  }
}

async function userDetailsHandler(): Promise<void> {
  telemetryHelpers.trackCommand('affinidi.me')

  const userDetails = await window.withProgress(
    { location: ProgressLocation.Notification, title: authMessage.fetchingAccountDetails },
    async () =>
      userManagementClient.me({
        consoleAuthToken: await authHelper.getConsoleAuthToken(),
      }),
  )

  readOnlyContentViewer.open({
    node: { label: 'AccountDetails', id: userDetails.userId },
    content: userDetails,
  })
}

export const initAuthentication = () => {
  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.authenticate', async () => {
      const method = await showQuickPick(
        [
          [labels.createAnAccountWithAffinidi, 'signUp'],
          [labels.login, 'login'],
        ],
        { title: authMessage.chooseAuthenticationMethod },
      )

      if (method === 'login') {
        await commands.executeCommand('affinidi.login')
      } else if (method === 'signUp') {
        await commands.executeCommand('affinidi.signUp')
      }
    }),
  )

  ext.context.subscriptions.push(commands.registerCommand('affinidi.signUp', signUpHandler))
  ext.context.subscriptions.push(commands.registerCommand('affinidi.login', loginHandler))
  ext.context.subscriptions.push(commands.registerCommand('affinidi.logout', logoutHandler))
  ext.context.subscriptions.push(commands.registerCommand('affinidi.me', userDetailsHandler))

  const authProvider = new AffinidiAuthenticationProvider()
  ext.context.subscriptions.push(authProvider)

  return authProvider
}
