import { window, workspace } from 'vscode'
import { errorMessage, telemetryMessage } from './messages'
import { sendRawAnalyticsEvent, EventNames, EventSubCategory } from './analyticsStreamApiService'

const CONSENT = {
  accept: telemetryMessage.accept,
  deny: telemetryMessage.deny,
}

function isTelemetryEnabled() {
  return workspace.getConfiguration().get('affinidi.telemetry.enabled')
}

async function askUserForTelemetryConsent() {
  if (isTelemetryEnabled() === null) {
    const consent = await window.showInformationMessage(
      telemetryMessage.sendUsageData,
      CONSENT.accept,
      CONSENT.deny,
    )

    switch (consent) {
      case CONSENT.accept:
        sendRawAnalyticsEvent({
          name: EventNames.extensionInitialized,
          subCategory: EventSubCategory.affinidiExtension,
          metadata: { analytics: 'enabled' },
        })
        await workspace.getConfiguration().update('affinidi.telemetry.enabled', true, true)

        break
      case CONSENT.deny:
        sendRawAnalyticsEvent({
          name: EventNames.extensionInitialized,
          subCategory: EventSubCategory.affinidiExtension,
          metadata: { analytics: 'disabled' },
          ignoreConfig: true,
        })
        await workspace.getConfiguration().update('affinidi.telemetry.enabled', false, true)
        break
      default:
        throw new Error(`${errorMessage.unknownConsentType} ${consent}`)
    }
  }
}

function registerTelemetryChanged() {
  if (!isTelemetryEnabled()) {
    sendRawAnalyticsEvent({
      name: EventNames.extensionInitialized,
      subCategory: EventSubCategory.affinidiExtension,
      metadata: { analytics: 'disabled' },
      ignoreConfig: true,
    })
  }
  if (isTelemetryEnabled()) {
    sendRawAnalyticsEvent({
      name: EventNames.extensionInitialized,
      subCategory: EventSubCategory.affinidiExtension,
      metadata: { analytics: 'enabled' },
    })
  }
}

function trackCommand(commandId: string, metadata?: any) {
  sendRawAnalyticsEvent({
    name: EventNames.commandExecuted,
    subCategory: EventSubCategory.command,
    metadata: {
      commandId,
      ...metadata,
    },
  })
}

function trackSnippetInserted(metadata: {
  snippetName: string
  language: string
  implementation: string
  projectId?: string
}) {
  sendRawAnalyticsEvent({
    name: EventNames.snippetInserted,
    subCategory: EventSubCategory.snippet,
    metadata,
  })
}

export const telemetryHelpers = {
  isTelemetryEnabled,
  askUserForTelemetryConsent,
  trackCommand,
  trackSnippetInserted,
  registerTelemetryChanged,
}
