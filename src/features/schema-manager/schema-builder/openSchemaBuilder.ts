import { l10n } from 'vscode'
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
    logger.error(error, 'Could not get or create Schema Builder')
    notifyError(error)
  }
}

async function getOrCreateBuilder(projectId?: string): Promise<SchemaBuilderWebview> {
  if (!builder || builder.isDisposed() || builder.projectId !== projectId) {
    builder?.dispose()

    if (!projectId) {
      projectId = await iamHelpers.askForProjectId()
      if (!projectId) {
        throw new Error(l10n.t('You must select a project to create a schema'))
      }
    }

    builder = new SchemaBuilderWebview(projectId, new SubmitHandler(new BuilderSchemaPublisher()))
  }

  return builder
}
