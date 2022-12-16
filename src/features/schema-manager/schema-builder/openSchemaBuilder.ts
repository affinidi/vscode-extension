import { configVault } from '../../../config/configVault'
import { schemaMessage } from '../../../messages/messages'
import { logger } from '../../../utils/logger'
import { notifyError } from '../../../utils/notifyError'
import { BuilderSchemaPublisher } from './BuilderSchemaPublisher'
import { SubmitHandler } from './handlers/SubmitHandler'
import { SchemaBuilderWebview } from './SchemaBuilderWebview'

let isLoading = false
let builder: SchemaBuilderWebview | undefined

export async function openSchemaBuilder(input?: {
  parentSchemaId?: string
  projectId?: string
  scope?: 'public' | 'unlisted'
}) {
  if (isLoading) return
  isLoading = true

  try {
    const builder = await getOrCreateBuilder(input)
    await builder.open()

    if (!input?.parentSchemaId) {
      builder.setScope(input?.scope ?? 'public')
    }
  } catch (error) {
    logger.error(error, schemaMessage.couldNotCreateSchemaBuilder)
    notifyError(error, schemaMessage.couldNotCreateSchemaBuilder)
  } finally {
    isLoading = false
  }
}

async function getOrCreateBuilder(input?: {
  projectId?: string
  parentSchemaId?: string
}): Promise<SchemaBuilderWebview> {
  if (
    !builder ||
    builder.isDisposed() ||
    builder.projectId !== input?.projectId ||
    builder.parentSchemaId !== input?.parentSchemaId
  ) {
    builder?.dispose()

    const projectId = input?.projectId ?? (await configVault.requireActiveProjectId())

    builder = new SchemaBuilderWebview(
      projectId,
      input?.parentSchemaId,
      new SubmitHandler(new BuilderSchemaPublisher()),
    )
  }

  return builder
}
