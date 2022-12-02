import { authentication, commands, window, l10n } from 'vscode'
import { ext } from '../extensionVariables'
import { userManagementClient } from '../features/user-management/userManagementClient'
import { authMessage, errorMessage, labels } from '../messages/messages'
import {
  sendEventToAnalytics,
  EventNames,
  EventSubCategory,
} from '../services/analyticsStreamApiService'
import { cliHelper } from '../utils/cliHelper'
import { openReadOnlyContent } from '../utils/openReadOnlyContent'
import { state } from '../state'
import {
  AffinidiAuthenticationProvider,
  AUTH_PROVIDER_ID,
} from './authentication-provider/affinidi-authentication-provider'
import { authHelper } from './authHelper'

const CONSENT = {
  accept: authMessage.accept,
  reject: authMessage.reject,
}

async function signUpHandler(): Promise<void> {
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

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: EventSubCategory.command,
        metadata: {
          commandId: 'affinidi.signUp',
        },
      })

      window.showInformationMessage(labels.signIn)
      ext.outputChannel.appendLine(labels.signIn)
      await cliHelper.isCliInstalledOrWarn({ type: 'warning' })
      break

    case CONSENT.reject:
      window.showInformationMessage(authMessage.rejectedTermsAndConditons)
      break
    default:
      throw new Error(`${errorMessage.unknownSelection} ${selection}`)
  }
}

async function loginHandler(): Promise<void> {
  await authentication.getSession(AUTH_PROVIDER_ID, ['login'], {
    forceNewSession: true,
  })

  sendEventToAnalytics({
    name: EventNames.commandExecuted,
    subCategory: EventSubCategory.command,
    metadata: {
      commandId: 'affinidi.login',
    },
  })

  window.showInformationMessage(labels.signIn)
  ext.outputChannel.appendLine(labels.signIn)
  await cliHelper.isCliInstalledOrWarn({ type: 'warning' })
}

async function logoutHandler(): Promise<void> {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: false,
  })

  await state.clear()

  if (session) {
    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidi.logout',
      },
    })

    await ext.authProvider.handleRemoveSession()

    await window.showInformationMessage(labels.signOut)
    ext.outputChannel.appendLine(labels.signOut)
  } else {
    await window.showInformationMessage(authMessage.notLoggedIn)
  }
}

async function userDetailsHandler(): Promise<void> {
  const userDetails = await userManagementClient.me({
    consoleAuthToken: await authHelper.getConsoleAuthToken(),
  })

  ext.outputChannel.appendLine(JSON.stringify(userDetails))
  openReadOnlyContent({
    node: { label: 'AccountDetails', id: userDetails.userId },
    content: userDetails,
  })

  sendEventToAnalytics({
    name: EventNames.commandExecuted,
    subCategory: EventSubCategory.command,
    metadata: {
      commandId: 'affinidi.me',
    },
  })
}

export const initAuthentication = () => {
  ext.context.subscriptions.push(commands.registerCommand('affinidi.signUp', signUpHandler))

  ext.context.subscriptions.push(commands.registerCommand('affinidi.login', loginHandler))

  ext.context.subscriptions.push(commands.registerCommand('affinidi.logout', logoutHandler))

  ext.context.subscriptions.push(commands.registerCommand('affinidi.me', userDetailsHandler))

  const authProvider = new AffinidiAuthenticationProvider()
  ext.context.subscriptions.push(authProvider)

  return authProvider
}
