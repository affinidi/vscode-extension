import { schemaMessage } from '../../../messages/messages'
import { logger } from '../../../utils/logger'
import { notifyError } from '../../../utils/notifyError'
import { iamHelpers } from '../../iam/iamHelpers'
import { BuilderSchemaPublisher } from './BuilderSchemaPublisher'
import { SubmitHandler } from './handlers/SubmitHandler'
import { SchemaBuilderWebview } from './SchemaBuilderWebview'

let builder: SchemaBuilderWebview | undefined

export async function openSchemaBuilder(input?: {
  projectId?: string
  scope?: 'public' | 'unlisted'
}) {
  try {
    const builder = await getOrCreateBuilder(input?.projectId)
    builder.open()
    builder.setScope(input?.scope ?? 'public')
  } catch (error) {
    logger.error(error, schemaMessage.couldNotCreateSchemaBuilder)
    notifyError(error)
  }
}

async function getOrCreateBuilder(projectId?: string): Promise<SchemaBuilderWebview> {
  if (!builder || builder.isDisposed() || builder.projectId !== projectId) {
    builder?.dispose()

    if (!projectId) {
      projectId = await iamHelpers.askForProjectId()
      if (!projectId) {
        throw new Error(schemaMessage.selectProjectToCreateSchema)
      }
    }

    builder = new SchemaBuilderWebview(projectId, new SubmitHandler(new BuilderSchemaPublisher()))
  }

  return builder
}
