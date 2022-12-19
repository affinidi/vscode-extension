import { z } from 'zod'
import Conf from 'conf'
import os from 'os'
import path from 'path'

import { ProjectSummary } from '@affinidi/client-iam'
import { OnDidChangeCallback } from 'conf/dist/source/types'

export type ConfigType = {
  version: number
  activeProjectSummary?: ProjectSummary
  session?: Session
}

export type Session = {
  sessionId: string
  consoleAuthToken: string
  account: { label: string; userId: string }
  scopes: []
}

const credentialsSchema = z.object({
  version: z.number(),
  activeProjectSummary: z.optional(
    z.object({
      apiKey: z.object({ apiKeyHash: z.string(), apiKeyName: z.string() }),
      project: z.object({ createdAt: z.string(), name: z.string(), projectId: z.string() }),
      wallet: z.object({
        did: z.string(),
        didUrl: z.string(),
      }),
    }),
  ),
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

export const VERSION = 1

class CredentialsVault {
  constructor(private readonly conf: Conf<ConfigType>) {}

  clear(): void {
    this.conf.clear()
  }

  delete(key: keyof ConfigType): void {
    this.conf.delete(key)
  }

  isValid(): boolean {
    return credentialsSchema.safeParse(this.conf.store).success
  }

  setActiveProjectSummary(value: ProjectSummary): void {
    this.conf.set('activeProjectSummary', value)
  }

  getSession(): Session | undefined {
    return this.conf.get('session')
  }

  setSession(value: Session): void {
    this.conf.set('session', value)
  }

  getVersion(): number | undefined {
    return this.conf.get('version')
  }

  onSessionChange(callback: OnDidChangeCallback<Session | undefined>) {
    return this.conf.onDidChange('session', callback)
  }
}

const credentialConf = new Conf<ConfigType>({
  configName: 'credentials',
  cwd: path.join(os.homedir(), '.affinidi'),
  defaults: { version: VERSION },
  watch: true,
})

export const credentialsVault = new CredentialsVault(credentialConf)
