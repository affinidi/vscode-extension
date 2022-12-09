import { ProjectDto } from '@affinidi/client-iam'
import { window } from 'vscode'
import { showQuickPick } from '../../utils/showQuickPick'
import { labels, projectMessage } from '../../messages/messages'
import { iamState } from './iamState'

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

export const iamHelpers = {
  askForProjectId,
  askForWalletUrl,
}
