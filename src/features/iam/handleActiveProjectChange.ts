import { Event, EventEmitter, FileChangeEvent } from 'vscode'
import {
  configVaultService,
  CONFIGS_KEY_NAME,
} from '../../auth/authentication-provider/configVault'
import { setActiveProject } from './setActiveProject'

export class AffinidiActiveProjectProvider {
  private readonly _onDidChangeActiveProject = new EventEmitter<FileChangeEvent>()

  constructor() {
    configVaultService.onDidChange(CONFIGS_KEY_NAME, this.handleExternalChangeActiveProject)
  }

  get onDidChangeActiveProject(): Event<FileChangeEvent> {
    return this._onDidChangeActiveProject.event
  }

  async handleExternalChangeActiveProject(): Promise<void> {
    const activeProjectId = await configVaultService.getActiveProjectId()
    setActiveProject(activeProjectId)
  }
}

export const affinidiActiveProjectChangeProvider = new AffinidiActiveProjectProvider()
