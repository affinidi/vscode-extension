import Conf from 'conf'
import { OnDidChangeCallback } from 'conf/dist/source/types'
import os from 'os'
import path from 'path'
import deepEqual from 'fast-deep-equal'
import { iamState } from '../features/iam/iamState'
import { NoProjectsError } from './NoProjectsError'
import { NoCurrentUserError } from './NoCurrentUserError'
import { notifyError } from '../utils/notifyError'
import { configMessage } from './messages'

export type UserConfig = {
  activeProjectId?: string
}

export type ConfigType = {
  version: number
  currentUserId?: string
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

  getObject() {
    return this.store.store
  }

  async requireActiveProjectId(): Promise<string> {
    if (!this.getCurrentUserId()) {
      throw new NoCurrentUserError()
    }

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
    } catch (error: unknown) {
      if (error instanceof NoProjectsError || error instanceof NoCurrentUserError) {
        return undefined
      }

      notifyError(error, configMessage.errorFetchingActiveProjectId)
      throw error
    }
  }

  async setUserConfig(userConfig: UserConfig): Promise<void> {
    const userId = this.getCurrentUserId()
    const existingConfigs = this.store.get('configs')

    const newConfigs = {
      ...existingConfigs,
      ...(userId && { [userId]: userConfig }),
    }

    this.store.set('configs', newConfigs)
  }

  async getUserConfig(): Promise<UserConfig | undefined> {
    const userId = this.getCurrentUserId()
    if (!userId) return undefined

    return this.store.get('configs')?.[userId]
  }

  getCurrentUserId(): string | undefined {
    return this.store.get('currentUserId')
  }

  setCurrentUserId(value: string): void {
    this.store.set('currentUserId', value)
  }

  getVersion(): number | undefined {
    return this.store.get('version')
  }

  onCurrentUserIdChange(callback: OnDidChangeCallback<string | undefined>) {
    return this.store.onDidChange('currentUserId', callback)
  }

  onUserConfigChange(callback: OnDidChangeCallback<UserConfig>) {
    return this.store.onDidChange('configs', async (newValue, oldValue) => {
      const userId = this.getCurrentUserId()
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
