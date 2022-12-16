import { window } from 'vscode'
import { z } from 'zod'
import { configVault } from './configVault'
import { credentialsVault } from './credentialsVault'

const credentials = z.object({
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

const version = z.object({
  version: z.number(),
})

function isValidObject(objectType: any, object: any) {
  return objectType.safeParse(object).success
}

export function validateVaultFiles() {
  // checking if extension installed for the first time
  const checkOnlyVersionKeyInConfig =
    isValidObject(version, configVault.getObject()) &&
    Object.keys(configVault.getObject()).length === 1

  if (checkOnlyVersionKeyInConfig) {
    return
  }

  const isConfigValid = isValidObject(config, configVault.getObject())
  const isCredentialsValid = isValidObject(credentials, credentialsVault.getObject())

  if (!(isConfigValid && isCredentialsValid)) {
    credentialsVault.clear()
    configVault.clear()

    window.showErrorMessage('Please update the version of CLI and the extension and signIn again')
  }
}
