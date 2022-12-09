import { ProjectDto } from '@affinidi/client-iam'
import { window, ProgressLocation } from 'vscode'
import { showQuickPick } from '../../utils/showQuickPick'
import { labels, projectMessage } from '../../messages/messages'
import { iamState } from './iamState'
import { authHelper } from '../../auth/authHelper'
import { iamClient } from './iamClient'
import { ext } from '../../extensionVariables'

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

async function askForWalletUrl(): Promise<string | undefined> {
  const wallet = await window.showInputBox({
    value: 'http://localhost:3000/holder/claim',
    prompt: labels.selectWallet,
  })

  return wallet
}

async function createDefaultProject(): Promise<void> {
  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: projectMessage.creatingDefaultProject,
    },
    async () =>
      iamClient.createProject(
        { name: 'Default Project' },
        { consoleAuthToken: await authHelper.getConsoleAuthToken() },
      ),
  )

  await iamState.clear()
  ext.explorerTree.refresh()
}

export const iamHelpers = {
  askForProjectId,
  askForWalletUrl,
  createDefaultProject,
}
