import Conf from 'conf'
import { OnDidChangeCallback } from 'conf/dist/source/types'
import * as os from 'os'
import * as path from 'path'
import * as deepEqual from 'fast-deep-equal'
import { ext } from '../extensionVariables'
import { iamState } from '../features/iam/iamState'
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

  clear(): void {
    this.store.clear()
  }

  delete(key: keyof ConfigType): void {
    this.store.delete(key)
  }

  async requireActiveProjectId(): Promise<string> {
    const userConfig = await this.getUserConfig()
    if (userConfig?.activeProjectId) {
      return userConfig.activeProjectId
    }

    const projects = await iamState.listProjects()
    if (projects.length === 0) {
      await this.setUserConfig({ activeProjectId: undefined })
      throw new NoProjectsError()
    }

    const activeProjectId = projects[0].projectId

    await this.setUserConfig({ activeProjectId })

    return activeProjectId
  }
  
  async getActiveProjectId(): Promise<string | undefined> {
    try {
      return await this.requireActiveProjectId()
    } catch (error) {
      if (error instanceof NoProjectsError) {
        return undefined
      }

      throw error
    }
  }

  async setUserConfig(userConfig: UserConfig): Promise<void> {
    const session = await ext.authProvider.getActiveSession()
    const existingConfigs = this.store.get('configs')

    const newConfigs = {
      ...existingConfigs,
      ...(session && { [session.account.id]: userConfig }),
    }

    this.store.set('configs', newConfigs)
  }

  async getUserConfig(): Promise<UserConfig | undefined> {
    const session = await ext.authProvider.getActiveSession()
    return session && this.store.get('configs')?.[session.account.id]
  }

  getCurrentUserId(): string {
    return this.store.get('currentUserId')
  }

  setCurrentUserId(value: string): void {
    this.store.set('currentUserId', value)
  }

  onCurrentUserIdChange(callback: OnDidChangeCallback<string>) {
    return this.store.onDidChange('currentUserId', callback)
  }

  onUserConfigChange(callback: OnDidChangeCallback<UserConfig>) {
    return this.store.onDidChange('configs', async (newValue, oldValue) => {
      const session = await ext.authProvider.getActiveSession()
      if (!session) return

      const oldConfig = oldValue?.[session.account.id]
      const newConfig = newValue?.[session.account.id]

      if (!deepEqual(newConfig, oldConfig)) {
        callback(newConfig, oldConfig)
      }
    })
  }

  onDidChange = this.store.onDidChange.bind(this.store)
}

const configConf = new Conf<ConfigType>({
  configName: 'config',
  cwd: path.join(os.homedir(), '.affinidi'),
  watch: true,
})

export const configVault = new ConfigVault(configConf)
