import Conf from 'conf'
import { Unsubscribe, OnDidChangeCallback, OnDidAnyChangeCallback } from 'conf/dist/source/types'
import * as os from 'os'
import * as path from 'path'
import { AuthenticationSession } from 'vscode'
import { ext } from '../../extensionVariables'

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

  public async getActiveProjectId(): Promise<string | null> {
    const value = this.store.get(CONFIGS_KEY_NAME)
    const session = await ext.authProvider.getActiveSession()
    // @ts-ignore
    return value && value[session?.account.id] ? value[session?.account.id].activeProjectId : null
  }

  public async setConfigs(projectId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const session = (await ext.authProvider.getActiveSession()) as AuthenticationSession

    const newConfigs = {
      [session.account.id]: { activeProjectId: projectId },
    }

    this.store.set(CONFIGS_KEY_NAME, newConfigs)
  }

  public getCurrentUserId = (): string => {
    const value = this.store.get(CURRENT_USER_ID_KEY_NAME)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return value as string
  }

  public setCurrentUserId = (value: string): void => {
    this.store.set(CURRENT_USER_ID_KEY_NAME, value)
  }

  public deleteCurrentUserId = (): void => {
    this.store.delete(CURRENT_USER_ID_KEY_NAME)
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
