import { authentication } from 'vscode'
import { apiFetch } from './api-client/api-fetch'
import { AUTH_PROVIDER_ID } from '../../auth/authentication-provider/affinidi-authentication-provider'
import { logger } from '../../utils/logger'
import { telemetryHelpers } from './telemetryHelpers'
import { credentialsVault } from '../../config/credentialsVault'

const affinidiPackage = require('../../../package.json')

// TODO: This JWT_TOKEN is valid only for 180 days(until 15-11-2023). We need to re-generate the new token by this date.
const JWT_TOKEN = 'ANALYTICS_JWT_TOKEN'
const ANALYTICS_STREAM_API_URL = 'https://analytics-stream.apse1.affinidi.io'

export const enum EventNames {
  commandExecuted = 'COMMAND_EXECUTED',
  snippetInserted = 'SNIPPET_INSERTED',
  extensionInitialized = 'EXTENSION_INITIALIZED',
}

export const enum EventSubCategory {
  command = 'command',
  snippet = 'snippet',
  affinidiExtension = 'affinidiExtension',
}

const INTERNAL_DOMAINS = ['affinidi.com', 'trustana.com', 'goodworker.in', 'lemmatree.com']

function generateUserMetadata(userEmail: string | undefined) {
  if (!userEmail) {
    return {}
  }

  const domain = userEmail.split('@')[1]
  const isUserInternal = INTERNAL_DOMAINS.includes(domain)
  const internalUserVertical = isUserInternal ? domain : undefined

  return {
    isUserInternal,
    internalUserVertical,
  }
}

export const sendRawAnalyticsEvent = async ({
  name,
  subCategory,
  metadata,
  ignoreConfig,
}: {
  name: EventNames
  subCategory?: EventSubCategory
  metadata?: any
  ignoreConfig?: boolean
}): Promise<void> => {
  if (credentialsVault.getEnvironment() !== 'prod') return
  if (!telemetryHelpers.isTelemetryEnabled() && !ignoreConfig) {
    return
  }

  const session = await authentication.getSession(AUTH_PROVIDER_ID, [])
  const uuid = session?.account?.id ?? 'anonymous-user'
  const userEmail = session?.account?.label

  try {
    await apiFetch({
      endpoint: `${ANALYTICS_STREAM_API_URL}/api/events`,
      method: 'POST',
      requestBody: {
        name,
        category: 'APPLICATION',
        subCategory,
        component: 'VsCodeExtension',
        uuid,
        metadata: {
          extensionVersion: affinidiPackage.version,
          ...generateUserMetadata(userEmail),
          ...metadata,
        },
      },
      headers: {
        authorization: `Bearer ${JWT_TOKEN}`,
      },
    })
  } catch (error) {
    logger.warn(error, 'Could not send analytics event')
  }
}
