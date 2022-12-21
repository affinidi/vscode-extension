import { z } from 'zod'
import Conf from 'conf'
import os from 'os'
import path from 'path'
import { ProjectSummary } from '@affinidi/client-iam'
import { OnDidChangeCallback } from 'conf/dist/source/types'
import { BasicConfVault } from './basicConfVault'

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

export const CREDENTIALS_VERSION = 1

const schema = z.object({
  version: z.number(),
  session: z.optional(
    z.object({
      sessionId: z.string(),
      consoleAuthToken: z.string(),
      account: z.object({
        label: z.string(),
        userId: z.string(),
      }),
      scopes: z.string().array(),
    }),
  ),
})

const defaults: ConfigType = { version: CREDENTIALS_VERSION }

export class CredentialsConfVault extends BasicConfVault<ConfigType> {
  constructor(conf: Conf<ConfigType>) {
    super(CREDENTIALS_VERSION, schema, conf, defaults)
  }

  getSession(): Session | undefined {
    return this.conf.get('session')
  }

  setSession(value: Session): void {
    this.conf.set('session', value)
  }

  onSessionChange(callback: OnDidChangeCallback<Session | undefined>) {
    return this.conf.onDidChange('session', callback)
  }
}

export function createCredentialsVault() {
  return new CredentialsConfVault(
    new Conf<ConfigType>({
      configName: 'credentials',
      cwd: path.join(os.homedir(), '.affinidi'),
      defaults,
      watch: true,
    }),
  )
}
