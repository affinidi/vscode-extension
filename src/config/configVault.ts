import Conf from 'conf'
import { OnDidChangeCallback } from 'conf/dist/source/types'
import os from 'os'
import path from 'path'
import deepEqual from 'fast-deep-equal'
import { iamState } from '../features/iam/iamState'
import { credentialsVault } from './credentialsVault'

export type UserConfig = {
  activeProjectId?: string
}

export type ConfigType = {
  version: number
  configs?: Record<string, UserConfig>
}

export const VERSION = 1

class ConfigVault {
  constructor(private readonly store: Conf<ConfigType>) {}

  clear(): void {
    this.store.clear()
  }

  delete(key: keyof ConfigType): void {
    this.store.delete(key)
  }

  async getActiveProjectId(): Promise<string | undefined> {
    if (!credentialsVault.getCurrentUserId()) {
      return undefined
    }

    const userConfig = await this.getUserConfig()
    if (userConfig?.activeProjectId) {
      return userConfig.activeProjectId
    }

    const projects = await iamState.listProjects()
    if (projects.length === 0) {
      await this.setUserConfig({ activeProjectId: undefined })
      return undefined
    }

    const activeProjectId = projects[0].projectId

    await this.setUserConfig({ activeProjectId })

    return activeProjectId
  }

  async setUserConfig(userConfig: UserConfig): Promise<void> {
    const userId = credentialsVault.getCurrentUserId()
    const existingConfigs = this.store.get('configs')

    const newConfigs = {
      ...existingConfigs,
      ...(userId && { [userId]: userConfig }),
    }

    this.store.set('configs', newConfigs)
  }

  async getUserConfig(): Promise<UserConfig | undefined> {
    const userId = credentialsVault.getCurrentUserId()
    if (!userId) return undefined

    return this.store.get('configs')?.[userId]
  }

  onUserConfigChange(callback: OnDidChangeCallback<UserConfig>) {
    return this.store.onDidChange('configs', async (newValue, oldValue) => {
      const userId = credentialsVault.getCurrentUserId()
      if (!userId) return

      const oldConfig = oldValue?.[userId]
      const newConfig = newValue?.[userId]

      if (!deepEqual(newConfig, oldConfig)) {
        callback(newConfig, oldConfig)
      }
    })
  }
}

const configConf = new Conf<ConfigType>({
  configName: 'config',
  cwd: path.join(os.homedir(), '.affinidi'),
  defaults: { version: VERSION },
  watch: true,
})

export const configVault = new ConfigVault(configConf)
