import Conf from 'conf'
import * as os from 'os'
import * as path from 'path'
import { AuthenticationSession } from 'vscode'
import { ext } from '../../extensionVariables'
import { iamState } from '../../features/iam/iamState'
import { setActiveProject } from '../../features/iam/setActiveProject'

export type ConfigType = {
  currentUserId: string
  configs: Record<string, { activeProjectId: string }>
}

class VaultService {
  constructor(private readonly store: Conf<ConfigType>) {}

  public clear = (): void => {
    this.store.clear()
  }

  public delete = (key: keyof ConfigType): void => {
    this.store.delete(key)
  }

  public async getActiveProjectId(): Promise<string | null> {
    const value = this.store.get('configs')
    const session = await ext.authProvider.getActiveSession()
    if (value && session && value[session.account.id]) {
      setActiveProject(value[session.account.id].activeProjectId)
      return value[session.account.id].activeProjectId
    }

    const projects = await iamState.listProjects()

    if (projects.length > 0) {
      setActiveProject(projects[0].projectId)
      return projects[0].projectId
    }
    return null
  }

  public async setConfigs(projectId: string): Promise<void> {
    const session = await ext.authProvider.getActiveSession()

    const newConfigs = {
      ...session && { [session.account.id]: { activeProjectId: projectId } },
    }

    this.store.set('configs', newConfigs)
  }

  public getCurrentUserId = (): string => {
    return this.store.get('currentUserId')
  }

  public setCurrentUserId = (value: string): void => {
    this.store.set('currentUserId', value)
  }

  public deleteCurrentUserId = (): void => {
    this.store.delete('currentUserId')
  }

  public onDidChange = this.store.onDidChange

  public onDidAnyChange = this.store.onDidAnyChange
}

const configConf = new Conf<ConfigType>({
  configName: 'config',
  cwd: path.join(os.homedir(), '.affinidi'),
  watch: true,
})

export const configVaultService = new VaultService(configConf)
