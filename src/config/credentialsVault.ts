import Conf from 'conf'
import * as os from 'os'
import * as path from 'path'

import { ProjectSummary } from '@affinidi/client-iam'
import { OnDidChangeCallback } from 'conf/dist/source/types'

export type ConfigType = {
  activeProjectSummary: ProjectSummary
  session: Session
}

export type Session = {
  sessionId: string
  consoleAuthToken: string
  account: { label: string; userId: string }
  scopes: []
}

class CredentialsVault {
  constructor(private readonly store: Conf<ConfigType>) {}

  clear(): void {
    this.store.clear()
  }

  setActiveProjectSummary(value: ProjectSummary): void {
    this.store.set('activeProjectSummary', value)
  }

  getSession(): Session | undefined {
    return this.store.get('session')
  }

  setSession(value: Session): void {
    this.store.set('session', value)
  }

  onSessionChange(callback: OnDidChangeCallback<Session>) {
    return this.store.onDidChange('session', callback)
  }
}

const credentialConf = new Conf<ConfigType>({
  configName: 'credentials',
  cwd: path.join(os.homedir(), '.affinidi'),
  watch: true,
})

export const credentialsVault = new CredentialsVault(credentialConf)
