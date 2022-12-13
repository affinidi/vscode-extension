import { SchemaDto, SchemaSearchScope } from '@affinidi/client-schema-manager'
import { window, ProgressLocation } from 'vscode'
import { ext } from '../../extensionVariables'
import { schemaMessage } from '../../messages/messages'
import { state } from '../../state'
import { reusePromise } from '../../utils/reusePromise'
import { iamState } from '../iam/iamState'
import { schemaManagerClient } from './schemaManagerClient'

const PREFIX = 'schema-manager:'
const storageKey = (input: string) => PREFIX + input

export class SchemaManagerState {
  async listAuthoredSchemas(input: {
    projectId: string
    scope?: SchemaSearchScope
  }): Promise<SchemaDto[]> {
    const scope = input.scope ?? 'default'

    return (await this.fetchAuthoredSchemas(input.projectId)).filter(
      (schema) =>
        scope === 'default' ||
        (scope === 'public' && schema.namespace === null) ||
        (scope === 'unlisted' && schema.namespace !== null),
    )
  }

  async getAuthoredSchemaById(input: {
    projectId: string
    schemaId: string
  }): Promise<SchemaDto | undefined> {
    return (await this.fetchAuthoredSchemas(input.projectId)).find(
      (schema) => schema.id === input.schemaId,
    )
  }

  clear() {
    state.clearByPrefix(PREFIX)
  }

  private fetchAuthoredSchemas = reusePromise(
    async (projectId: string): Promise<SchemaDto[]> => {
      const key = storageKey(`authored:by-project:${projectId}`)
      const stored = ext.context.globalState.get<SchemaDto[]>(key)
      if (stored) return stored

      const {
        wallet: { did },
        apiKey: { apiKeyHash },
      } = await iamState.requireProjectSummary(projectId)

      const { schemas } = await window.withProgress(
        { location: ProgressLocation.Notification, title: schemaMessage.fetchingSchemas },
        async () => schemaManagerClient.searchSchemas({ did, authorDid: did }, { apiKeyHash }),
      )

      await ext.context.globalState.update(key, schemas)

      return schemas
    },
  )
}

export const schemaManagerState = new SchemaManagerState()
