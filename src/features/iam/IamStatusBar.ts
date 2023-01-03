import { Disposable, StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { configVault } from '../../config/configVault'
import { projectMessage } from '../../messages/messages'
import { notifyError } from '../../utils/notifyError'
import { iamState } from './iamState'

export class IamStatusBar implements Disposable {
  private readonly item: StatusBarItem

  constructor() {
    this.item = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  }

  async update() {
    try {
      const { text, command } = await this._generateItem()
      this.item.text = text
      this.item.command = command
      this.item.show()
    } catch (error) {
      notifyError(error, projectMessage.failedToUpdateIamStatusBar)
      this.item.hide()
    }
  }

  private async _generateItem(): Promise<{ text: string; command: string }> {
    const currentUserId = configVault.getCurrentUserId()
    if (!currentUserId) {
      return {
        text: 'Affinidi',
        command: 'affinidi.authenticate',
      }
    }

    const activeProjectId = await configVault.getActiveProjectId()
    if (!activeProjectId) {
      return {
        text: 'Affinidi',
        command: 'affinidi.createProject',
      }
    }

    const activeProject = await iamState.requireActiveProject()
    const projects = await iamState.listProjects()

    return {
      text: `Affinidi: ${activeProject.name}`,
      command:
        projects.length > 1 ? 'affinidi.selectActiveProject' : 'affinidi.viewProjectProperties',
    }
  }

  dispose() {
    this.item.dispose()
  }
}
