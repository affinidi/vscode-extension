import { ProjectDto } from '@affinidi/client-iam'
import { showQuickPick } from '../../utils/showQuickPick'
import { projectMessage } from '../../messages/messages'
import { iamState } from './iamState'
import { createProjectProcess } from './createProjectProcess'
import { configVault } from '../../config/configVault'

async function askForProjectId(): Promise<string | undefined> {
  const projects = await iamState.listProjects()

  if (projects.length === 0) {
    throw new Error(projectMessage.projectRequired)
  }

  let project: ProjectDto | undefined = projects[0]

  if (projects.length > 1) {
    project = await showQuickPick(
      projects.map((project) => [project.name, project]),
      { title: projectMessage.selectProject },
    )
  }

  return project?.projectId
}

async function setupInitialProject() {
  const project = await createProjectProcess('Default Project')
  if (project) {
    configVault.setUserConfig({ activeProjectId: project.projectId })
  }
}

export const iamHelpers = {
  askForProjectId,
  setupInitialProject,
}
