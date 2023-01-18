import { window } from 'vscode'
import { z } from 'zod'
import { configVault } from './configVault'
import { credentialsVault } from './credentialsVault'
import { configMessage } from './messages'

const credentials = z.object({
  version: z.number(),
  env: z.enum(['dev', 'staging', 'prod']).optional(),
  activeProjectSummary: z.object({
    apiKey: z.object({ apiKeyHash: z.string(), apiKeyName: z.string() }),
    project: z.object({ createdAt: z.string(), name: z.string(), projectId: z.string() }),
    wallet: z.object({
      did: z.string(),
      didUrl: z.string(),
    }),
  }),
  session: z.object({
    sessionId: z.string(),
    consoleAuthToken: z.string(),
    account: z.object({
      label: z.string(),
      userId: z.string(),
    }),
    scopes: z.string().array(),
  }),
})

const config = z.object({
  version: z.number(),
  currentUserId: z.string(),
  configs: z.record(z.optional(z.object({ activeProjectId: z.string() }))),
})

function isValidObject(objectType: any, object: any) {
  return objectType.safeParse(object).success
}

const configInlogin = z.object({
  version: z.number(),
  configs: z.record(z.optional(z.object({ activeProjectId: z.string() }))).optional(),
})

export function validateVaultFilesInLogin() {
  const checkOnlyVersionKeyInConfig = isValidObject(configInlogin, configVault.getObject())

  if (!checkOnlyVersionKeyInConfig) {
    credentialsVault.clear()
    configVault.clear()

    window.showErrorMessage(configMessage.invalidConfigFiles)
  }
}

export function validateVaultFilesInAuth() {
  const isConfigValid = isValidObject(config, configVault.getObject())
  const isCredentialsValid = isValidObject(credentials, credentialsVault.getObject())

  if (!(isConfigValid && isCredentialsValid)) {
    credentialsVault.clear()
    configVault.clear()

    window.showErrorMessage(configMessage.invalidConfigFiles)
  }
}
