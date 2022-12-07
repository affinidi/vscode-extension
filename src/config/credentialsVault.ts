import Conf from 'conf'
import * as os from 'os'
import * as path from 'path'

import { ProjectSummary } from '@affinidi/client-iam'

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

  public clear = (): void => {
    this.store.clear()
  }

  public setActiveProjectSummary = (value: ProjectSummary): void => {
    this.store.set('activeProjectSummary', value)
  }

  public getSession = (): Session | undefined => {
    return this.store.get('session')
  }

  public setSession = (value: Session): void => {
    this.store.set('session', value)
  }

  public onDidChange = this.store.onDidChange.bind(this.store)
}

const credentialConf = new Conf<ConfigType>({
  configName: 'credentials',
  cwd: path.join(os.homedir(), '.affinidi'),
  watch: true,
})

export const credentialsVault = new CredentialsVault(credentialConf)
