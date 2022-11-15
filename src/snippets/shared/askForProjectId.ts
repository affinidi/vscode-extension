import { l10n } from 'vscode'
import { iamService, Project } from '../../services/iamService'
import { showQuickPick } from '../../utils/showQuickPick'

export async function askForProjectId(): Promise<string | undefined> {
  const { projects } = await iamService.getProjects()
  if (projects.length === 0) {
    throw new Error(l10n.t('You need to have a project to generate this snippet'))
  }

  let project: Project | undefined = projects[0]
  if (projects.length > 1) {
    project = await showQuickPick(
      projects.map((project) => [project.name, project]),
      { title: l10n.t('Select a project') },
    )
  }

  return project?.projectId
}
