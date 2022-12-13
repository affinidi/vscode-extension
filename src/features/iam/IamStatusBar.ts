import { Disposable, StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { configVault } from '../../config/configVault'
import { logger } from '../../utils/logger'
import { notifyError } from '../../utils/notifyError'
import { reusePromise } from '../../utils/reusePromise'
import { iamState } from './iamState'

export class IamStatusBar implements Disposable {
  private readonly item: StatusBarItem

  constructor() {
    this.item = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  }

  update = reusePromise(async () => {
    try {
      const { text, command } = await this._generateItem()
      this.item.text = text
      this.item.command = command
      this.item.show()
    } catch (error) {
      logger.error(error, 'Could not update IAM status bar item')
      notifyError(error)
      this.item.hide()
    }
  })

  private async _generateItem(): Promise<{ text: string; command: string }> {
    const currentUserId = configVault.getCurrentUserId()
    if (!currentUserId) {
      return {
        text: '$(account) Affinidi: Not authenticated',
        command: 'affinidi.authenticate',
      }
    }

    const activeProjectId = await configVault.getActiveProjectId()
    if (!activeProjectId) {
      return {
        text: '$(file-directory-create) Affinidi: Create a project',
        command: 'affinidi.createProject',
      }
    }

    const activeProject = await iamState.requireActiveProject()
    const projects = await iamState.listProjects()

    return {
      text: `$(project) Affinidi: ${activeProject.name}`,
      command:
        projects.length > 1 ? 'affinidi.selectActiveProject' : 'affinidi.viewProjectProperties',
    }
  }

  dispose() {
    this.item.dispose()
  }
}
