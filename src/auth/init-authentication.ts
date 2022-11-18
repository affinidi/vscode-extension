import { authentication, commands, window, l10n } from 'vscode'
import { ext } from '../extensionVariables'
import { userManagementClient } from '../features/user-management/userManagementClient'
import {
  sendEventToAnalytics,
  EventNames,
  EventSubCategory,
} from '../services/analyticsStreamApiService'
import { projectsState } from '../states/projectsState'
import { cliHelper } from '../utils/cliHelper'
import { openReadOnlyContent } from '../utils/openReadOnlyContent'
import {
  AffinidiAuthenticationProvider,
  AUTH_PROVIDER_ID,
} from './authentication-provider/affinidi-authentication-provider'
import { authHelper } from './authHelper'

const CONSENT = {
  accept: l10n.t('Accept'),
  reject: l10n.t('Reject'),
}

async function signUpHandler(): Promise<void> {
  const selection = await window.showWarningMessage(
    l10n.t(
      'Please read and accept the [Terms of Use](https://build.affinidi.com/dev-tools/terms-of-use.pdf) and [Privacy Policy](https://build.affinidi.com/dev-tools/privacy-policy.pdf)',
    ),
    CONSENT.accept,
    CONSENT.reject,
  )

  switch (selection) {
    case CONSENT.accept:
      window.showInformationMessage(l10n.t('You accepted terms and conditions'))

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

      window.showInformationMessage(l10n.t('Signed In to Affinidi'))
      ext.outputChannel.appendLine(l10n.t('Signed In to Affinidi'))
      await cliHelper.isCliInstalledOrWarn({ type: 'warning' })
      break

    case CONSENT.reject:
      window.showInformationMessage(l10n.t('You rejected terms and conditions'))
      break
    default:
      throw new Error(`unknown selection: ${selection}`)
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

  window.showInformationMessage(l10n.t('Signed In to Affinidi'))
  ext.outputChannel.appendLine(l10n.t('Signed In to Affinidi'))
  await cliHelper.isCliInstalledOrWarn({ type: 'warning' })
}

async function logoutHandler(): Promise<void> {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: false,
  })

  projectsState.clear()

  if (session) {
    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: 'affinidi.logout',
      },
    })

    await ext.authProvider.handleRemoveSession()

    await window.showInformationMessage(l10n.t('Signed Out of Affinidi'))
    ext.outputChannel.appendLine(l10n.t('Signed Out of Affinidi'))
  } else {
    await window.showInformationMessage(l10n.t('Not logged in to Affinidi'))
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
