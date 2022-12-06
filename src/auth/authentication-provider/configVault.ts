import Conf from 'conf'
import { Unsubscribe, OnDidChangeCallback, OnDidAnyChangeCallback } from 'conf/dist/source/types'
import * as os from 'os'
import * as path from 'path'

export const CONFIGS_KEY_NAME = 'configs'
export const CURRENT_USER_ID_KEY_NAME = 'currentUserId'

export type Configs = {
  currentUserId: string
  configs: Record<string, { activeProjectId: string }>
}

class VaultService {
  private readonly store: Conf

  constructor(store: Conf) {
    this.store = store
  }

  public clear = (): void => {
    this.store.clear()
  }

  public delete = (key: string): void => {
    this.store.delete(key)
  }

  public getActiveProjectId = (userId: string): string | null => {
    const value = this.store.get(CONFIGS_KEY_NAME)
    // @ts-ignore
    return value && value[userId] ? value[userId].activeProjectId : null
  }

  public setConfigs = (userId: string, projectId: string): void => {
    const newConfigs = {
      [userId]: { activeProjectId: projectId },
    }

    this.store.set(CONFIGS_KEY_NAME, newConfigs)
  }

  public getCurrentUserID = (): string => {
    const value = this.store.get(CURRENT_USER_ID_KEY_NAME)
    return value as string
  }

  public setCurrentUserID = (value: string): void => {
    this.store.set(CURRENT_USER_ID_KEY_NAME, value)
  }

  public onDidChange = (key: string, callback: OnDidChangeCallback<unknown>): Unsubscribe => {
    return this.store.onDidChange(key, callback)
  }

  public onDidAnyChange = (
    callback: OnDidAnyChangeCallback<Record<string, unknown>>,
  ): Unsubscribe => {
    return this.store.onDidAnyChange(callback)
  }
}

const configConf = new Conf({
  configName: 'config',
  cwd: path.join(os.homedir(), '.affinidi'),
  watch: true,
})

export const configVaultService = new VaultService(configConf)
