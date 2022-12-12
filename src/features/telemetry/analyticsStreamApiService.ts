import { authentication } from 'vscode'
import { apiFetch } from './api-client/api-fetch'
import { AUTH_PROVIDER_ID } from '../../auth/authentication-provider/affinidi-authentication-provider'
import { logger } from '../../utils/logger'
import { telemetryHelpers } from './telemetryHelpers'

const affinidiPackage = require('../../package.json')

// TODO: This JWT_TOKEN is valid only for 180 days(until 24-04-2023). We need to re-generate the new token by this date.
const JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOTQ0MzY0ZS02NjcwLTQ4M2QtYjM3NC1hMDMyODQwYzliYjUiLCJ1c2VyTmFtZSI6ImFudXNoYS5rQGFmZmluaWRpLmNvbSIsImlhdCI6MTY2Njg4MjE4MywiZXhwIjoxNjgyNDM0MTgzfQ.dI3c9vy3xJu_SZVIUH9T2dbuuVXRuZv-qXs3lYXFrMU'
const ANALYTICS_STREAM_API_URL = 'https://analytics-stream.prod.affinity-project.org'

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
}: {
  name: EventNames
  subCategory?: EventSubCategory
  metadata?: any
}): Promise<void> => {
  if (!telemetryHelpers.isTelemetryEnabled()) {
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
