import { Event, EventEmitter, FileChangeEvent, FileChangeType, Uri } from 'vscode'
import * as path from 'path'
import * as os from 'os'
import {
  configVaultService,
  CONFIGS_KEY_NAME,
} from '../../auth/authentication-provider/configVault'

export class AffinidiActiveProjectProvider {
  private readonly _onDidChangeActiveProject = new EventEmitter<FileChangeEvent>()

  constructor() {
    configVaultService.onDidChange(CONFIGS_KEY_NAME, this.handleExternalChangeActiveProject)
  }

  get onDidChangeActiveProject(): Event<FileChangeEvent> {
    return this._onDidChangeActiveProject.event
  }

  handleExternalChangeActiveProject = (): void => {
    this._onDidChangeActiveProject.fire({
      type: FileChangeType.Changed,
      uri: Uri.file(path.join(os.homedir(), '.affinidi/config.json')),
    })
  }
}

export const affinidiActiveProjectChangeProvider = new AffinidiActiveProjectProvider()
