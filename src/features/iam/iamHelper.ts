import { ProjectDto, Options } from '@affinidi/client-iam'
import { l10n } from 'vscode'
import { showQuickPick } from '../../utils/showQuickPick'
import { iamClient } from './iamClient'

export const PROJECT_REQUIRED_ERROR_MESSAGE = l10n.t(
  'You need to have a project to perform this operation',
)

async function askForProjectId(options: Options): Promise<string | undefined> {
  const { projects } = await iamClient.listProjects(options)

  if (projects.length === 0) {
    throw new Error(PROJECT_REQUIRED_ERROR_MESSAGE)
  }

  let project: ProjectDto | undefined = projects[0]
  if (projects.length > 1) {
    project = await showQuickPick(
      projects.map((p) => [p.name, p]),
      { title: l10n.t('Select a project') },
    )
  }

  return project?.projectId
}

export const iamHelper = {
  askForProjectId,
}
