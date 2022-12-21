import { z } from 'zod'
import Conf from 'conf'
import os from 'os'
import path from 'path'
import { BasicConfVault } from './basicConfVault'

export type UserConfig = {
  activeProjectId?: string
}

export type ConfigType = {
  version: number
  configs?: Record<string, UserConfig>
}

export const CONFIG_VERSION = 1

const defaults: ConfigType = { version: CONFIG_VERSION }

const schema = z.object({
  version: z.number(),
  configs: z.optional(z.record(z.optional(z.object({ activeProjectId: z.optional(z.string()) })))),
})

export class ConfigConfVault extends BasicConfVault<ConfigType> {
  constructor(conf: Conf<ConfigType>) {
    super(CONFIG_VERSION, schema, conf, defaults)
  }

  setUserConfig(userId: string, userConfig: UserConfig): void {
    this.conf.set('configs', {
      ...this.conf.get('configs'),
      [userId]: userConfig,
    })
  }

  amendUserConfig(userId: string, userConfig: UserConfig): void {
    this.setUserConfig(userId, {
      ...this.getUserConfig(userId),
      ...userConfig,
    })
  }

  getUserConfig(userId: string): UserConfig | undefined {
    return this.conf.get('configs')?.[userId]
  }
}

export function createConfigVault() {
  return new ConfigConfVault(
    new Conf<ConfigType>({
      configName: 'config',
      cwd: path.join(os.homedir(), '.affinidi'),
      defaults,
      watch: true,
    }),
  )
}
