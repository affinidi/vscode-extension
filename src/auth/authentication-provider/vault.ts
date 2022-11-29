import Conf from 'conf'
import { Unsubscribe, OnDidChangeCallback, OnDidAnyChangeCallback } from 'conf/dist/source/types'
import * as os from 'os'
import * as path from 'path'

export const SESSION_KEY_NAME = 'session'
export const ACTIVE_PROJECT_KEY_NAME = 'activeProjectSummary'

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

  public get = (key: string): string | null => {
    const value = this.store.get(key)
    return typeof value === 'string' ? value : null
  }

  public set = (key: string, value: string): void => {
    this.store.set(key, value)
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

const credentialConf = new Conf({
  cwd: path.join(os.homedir(), '.affinidi', 'credentials'),
  watch: true,
})

const configConf = new Conf({
  cwd: path.join(os.homedir(), '.affinidi', 'config'),
  watch: true,
})

export const credentialsVaultService = new VaultService(credentialConf)
export const configVaultService = new VaultService(configConf)
