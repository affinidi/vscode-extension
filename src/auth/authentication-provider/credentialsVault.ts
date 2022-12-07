import Conf from 'conf'
import { Unsubscribe, OnDidChangeCallback, OnDidAnyChangeCallback } from 'conf/dist/source/types'
import * as os from 'os'
import * as path from 'path'

import { ProjectSummary } from '@affinidi/client-iam'

export const SESSION_KEY_NAME = 'session'
export const ACTIVE_PROJECT_SUMMARY_KEY_NAME = 'activeProjectSummary'

export type Session = {
  sessionId: string
  consoleAuthToken: string
  account: { label: string; userId: string }
  scopes: []
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

  public setActiveProjectSummary = (value: ProjectSummary): void => {
    this.store.set(ACTIVE_PROJECT_SUMMARY_KEY_NAME, value)
  }

  public getSession = (): Session | null => {
    const value = this.store.get(SESSION_KEY_NAME)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return value ? (value as Session) : null
  }

  public setSession = (value: Session): void => {
    this.store.set(SESSION_KEY_NAME, value)
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
  configName: 'credentials',
  cwd: path.join(os.homedir(), '.affinidi'),
  watch: true,
})

export const credentialsVaultService = new VaultService(credentialConf)
