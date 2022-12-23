import Conf from 'conf'
import os from 'os'
import path from 'path'

import { ProjectSummary } from '@affinidi/client-iam'
import { OnDidChangeCallback } from 'conf/dist/source/types'

export type ConfigType = {
  version: number
  session?: Session
}

export type Session = {
  sessionId: string
  consoleAuthToken: string
  account: { label: string; userId: string }
  scopes: []
}

export const VERSION = 1

class CredentialsVault {
  constructor(private readonly store: Conf<ConfigType>) {}

  clear(): void {
    this.store.clear()
  }

  delete(key: keyof ConfigType): void {
    this.store.delete(key)
  }

  getSession(): Session | undefined {
    return this.store.get('session')
  }

  setSession(value: Session): void {
    this.store.set('session', value)
  }

  getCurrentUserId(): string | undefined {
    return this.getSession()?.account.userId
  }

  onSessionChange(callback: OnDidChangeCallback<Session | undefined>) {
    return this.store.onDidChange('session', callback)
  }
}

const credentialConf = new Conf<ConfigType>({
  configName: 'credentials',
  cwd: path.join(os.homedir(), '.affinidi'),
  defaults: { version: VERSION },
  watch: true,
})

export const credentialsVault = new CredentialsVault(credentialConf)
