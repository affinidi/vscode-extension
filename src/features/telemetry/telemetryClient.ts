import { ext } from '../../extensionVariables'
import { logger } from '../../utils/logger'
import { AnalyticsStreamApi, analyticsStreamApi } from './analyticsStreamApi'
import { generateUserMetadata } from './generateUserMetadata'
import { isTelemetryEnabled } from './isTelemetryEnabled'

const packageJson = require('../../../package.json')

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

export class TelemetryClient {
  constructor(private readonly api: AnalyticsStreamApi) {}

  async trackCommandExecution(command: string, input?: { metadata?: object; projectId?: string }) {
    await this.sendEvent({
      name: EventNames.commandExecuted,
      subCategory: EventSubCategory.command,
      metadata: {
        commandId: command,
        projectId: input?.projectId,
        ...input?.metadata,
      },
    })
  }

  async sendEvent(input: {
    name: EventNames
    subCategory?: EventSubCategory
    metadata?: object
  }): Promise<void> {
    try {
      if (!isTelemetryEnabled()) {
        return
      }

      const session = await ext.authProvider.getActiveSession()
      const uuid = session?.account?.id ?? 'anonymous-user'
      const userEmail = session?.account?.label

      await this.api.sendEvent({
        uuid,
        name: input.name,
        subCategory: input.subCategory,
        category: 'APPLICATION',
        component: 'VsCodeExtension',
        metadata: {
          extensionVersion: packageJson.version,
          ...generateUserMetadata(userEmail),
          ...input.metadata,
        },
      })
    } catch (error) {
      logger.error(error, 'Could not send telemetry event')
    }
  }
}

export const telemetryClient = new TelemetryClient(analyticsStreamApi)
