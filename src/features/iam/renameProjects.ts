import { ProgressLocation, window } from 'vscode'
import { ext } from '../../extensionVariables'
import { projectMessage } from '../../messages/messages'
import { BasicTreeItemWithProject } from '../../tree/basicTreeItemWithProject'
import { notifyError } from '../../utils/notifyError'
import { iamClient } from './iamClient'
import { iamState } from './iamState'

export const renameProject = async (oldName: string, newName: string) => {
  const {
    apiKey: { apiKeyHash },
  } = await iamState.requireProjectSummary(oldName)

  try {
    const data = await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: projectMessage.renameProject,
      },
      async () => {
        return iamClient.patchProject(
          {
            oldName,
            newName,
          },
          { apiKeyHash },
        )
      },
    )

    window.showInformationMessage(projectMessage.projectRenamed)
    ext.outputChannel.appendLine(JSON.stringify(data, null, 2))
    ext.outputChannel.show()
  } catch (error: unknown) {
    notifyError(error, projectMessage.projectRenameFailed)
    ext.outputChannel.appendLine(JSON.stringify(error, null, 2))
  }
}

export const activateRenameProject = async (element: BasicTreeItemWithProject) => {
  const newName = await window.showInputBox({
    prompt: `Enter the new name for the project "${element.label}":`,
  })

  if (newName) {
    await renameProject(element.projectId, newName)
  }
}
