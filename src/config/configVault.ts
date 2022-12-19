import { z } from 'zod'
import Conf from 'conf'
import { OnDidChangeCallback } from 'conf/dist/source/types'
import os from 'os'
import path from 'path'
import deepEqual from 'fast-deep-equal'
import { iamState } from '../features/iam/iamState'
import { NoProjectsError } from './NoProjectsError'
import { NoCurrentUser } from './NoCurrentUser'

export type UserConfig = {
  activeProjectId?: string
}

export type ConfigType = {
  version: number
  currentUserId?: string
  configs: Record<string, UserConfig>
}

const configSchema = z.object({
  version: z.number(),
  currentUserId: z.optional(z.string()),
  configs: z.record(z.optional(z.object({ activeProjectId: z.string() }))),
})

export const VERSION = 1

class ConfigVault {
  constructor(private readonly conf: Conf<ConfigType>) {}

  clear(): void {
    this.conf.clear()
  }

  delete(key: keyof ConfigType): void {
    this.conf.delete(key)
  }

  isValid(): boolean {
    return configSchema.safeParse(this.conf.store).success
  }

  async requireActiveProjectId(): Promise<string> {
    if (!this.getCurrentUserId()) {
      throw new NoCurrentUser()
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
    } catch (error) {
      if (error instanceof NoProjectsError || error instanceof NoCurrentUser) {
        return undefined
      }

      throw error
    }
  }

  async setUserConfig(userConfig: UserConfig): Promise<void> {
    const userId = this.getCurrentUserId()
    const existingConfigs = this.conf.get('configs')

    const newConfigs = {
      ...existingConfigs,
      ...(userId && { [userId]: userConfig }),
    }

    this.conf.set('configs', newConfigs)
  }

  async getUserConfig(): Promise<UserConfig | undefined> {
    const userId = this.getCurrentUserId()
    if (!userId) return undefined

    return this.conf.get('configs')?.[userId]
  }

  getCurrentUserId(): string | undefined {
    return this.conf.get('currentUserId')
  }

  setCurrentUserId(value: string): void {
    this.conf.set('currentUserId', value)
  }

  getVersion(): number | undefined {
    return this.conf.get('version')
  }

  onCurrentUserIdChange(callback: OnDidChangeCallback<string | undefined>) {
    return this.conf.onDidChange('currentUserId', callback)
  }

  onUserConfigChange(callback: OnDidChangeCallback<UserConfig>) {
    return this.conf.onDidChange('configs', async (newValue, oldValue) => {
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
