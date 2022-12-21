import { commands, window } from 'vscode'
import { ext } from '../../extensionVariables'
import { projectMessage } from '../../messages/messages'
import { readOnlyContentViewer } from '../../utils/openReadOnlyContent'
import { showQuickPick } from '../../utils/showQuickPick'
import { telemetryHelpers } from '../telemetry/telemetryHelpers'
import { IamStatusBar } from './IamStatusBar'
import { createProjectProcess } from './createProjectProcess'
import { iamState } from './iamState'
import { InactiveProjectTreeItem } from './tree/treeItems'

async function viewProjectProperties() {
  telemetryHelpers.trackCommand('affinidi.viewProjectProperties')

  const activeProject = await iamState.getActiveProject()
  if (!activeProject) return

  const activeProjectSummary = await iamState.getProjectSummary(activeProject.projectId)
  if (!activeProjectSummary) return

  await readOnlyContentViewer.open({
    node: { label: activeProject.name, id: activeProject.projectId },
    content: activeProjectSummary,
  })
}

async function activateProject(element: InactiveProjectTreeItem) {
  telemetryHelpers.trackCommand('affinidiExplorer.activateProject', {
    projectId: element.projectId,
  })

  const project = await iamState.getProjectById(element.projectId)
  if (!project) return

  ext.configuration.setActiveProjectId(project.projectId)

  window.showInformationMessage(projectMessage.activatedProject(project.name))
}

async function selectActiveProject() {
  telemetryHelpers.trackCommand('affinidi.selectActiveProject')

  const projects = await iamState.listProjects()
  const project = await showQuickPick(
    projects.map((p) => [p.name, p]),
    { title: projectMessage.selectActiveProject },
  )
  if (!project) return

  ext.configuration.setActiveProjectId(project.projectId)

  window.showInformationMessage(projectMessage.activatedProject(project.name))
}

async function createProject() {
  telemetryHelpers.trackCommand('affinidi.createProject')

  await createProjectProcess()

  iamState.clear()
  ext.explorerTree.refresh()
}

export async function initIam() {
  const iamStatusBar = new IamStatusBar()
  iamStatusBar.update()

  ext.context.subscriptions.push(
    iamStatusBar,
    iamState.onDidUpdate(() => iamStatusBar.update()),
  )

  ext.context.subscriptions.push(
    commands.registerCommand('affinidi.viewProjectProperties', viewProjectProperties),
    commands.registerCommand('affinidiExplorer.activateProject', activateProject),
    commands.registerCommand('affinidi.selectActiveProject', selectActiveProject),
    commands.registerCommand('affinidi.createProject', createProject),
  )
}
