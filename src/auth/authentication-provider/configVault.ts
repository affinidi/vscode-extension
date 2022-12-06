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

  public getConfigs = (): Configs | null => {
    const value = this.store.get(CONFIGS_KEY_NAME)
    console.log(value ? (value['108a297e-8e32-46b8-ba5b-0390b958219a'].activeProjectId) : null)
    return value ? (value as Configs) : null
  }

  public setConfigs = (value: Configs): void => {
    this.store.set(CONFIGS_KEY_NAME, value)
  }

  public getCurrentUserID = (): string | null => {
    const value = this.store.get(CURRENT_USER_ID_KEY_NAME)
    return typeof value === 'string' ? value : null
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
