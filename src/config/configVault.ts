import Conf from 'conf'
import * as os from 'os'
import * as path from 'path'
import { ext } from '../extensionVariables'
import { iamState } from '../features/iam/iamState'
import { credentialsVault } from './credentialsVault'
import { NoProjectsError } from './NoProjectsError'

export type UserConfig = {
  activeProjectId?: string
}

export type ConfigType = {
  currentUserId: string
  configs: Record<string, UserConfig>
}

class ConfigVault {
  constructor(private readonly store: Conf<ConfigType>) {}

  public clear = (): void => {
    this.store.clear()
  }

  public delete = (key: keyof ConfigType): void => {
    this.store.delete(key)
  }

  public async requireActiveProjectId(): Promise<string> {
    const userConfig = await this.getUserConfig()
    if (userConfig && userConfig.activeProjectId) {
      return userConfig.activeProjectId
    }

    const projects = await iamState.listProjects()
    if (projects.length === 0) {
      throw new NoProjectsError()
    }

    const activeProjectId = projects[0].projectId

    this.setUserConfig({ activeProjectId })
    credentialsVault.setActiveProjectSummary(await iamState.requireProjectSummary(activeProjectId))

    return activeProjectId
  }

  public async setUserConfig(userConfig: UserConfig): Promise<void> {
    const session = await ext.authProvider.getActiveSession()
    const existingConfigs = this.store.get('configs')

    const newConfigs = {
      ...existingConfigs,
      ...session && { [session.account.id]: userConfig },
    }

    this.store.set('configs', newConfigs)
  }

  public getUserConfig = async (): Promise<UserConfig | undefined> => {
    const session = await ext.authProvider.getActiveSession()
    return session && this.store.get('configs')?.[session.account.id]
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

  public onDidChange = this.store.onDidChange.bind(this.store)
}

const configConf = new Conf<ConfigType>({
  configName: 'config',
  cwd: path.join(os.homedir(), '.affinidi'),
  watch: true,
})

export const configVault = new ConfigVault(configConf)
