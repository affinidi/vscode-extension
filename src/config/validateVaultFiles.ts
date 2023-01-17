import { window } from 'vscode'
import { z } from 'zod'
import { configVault } from './configVault'
import { credentialsVault } from './credentialsVault'
import { configMessage } from './messages'

const credentials = z.object({
  version: z.number(),
  activeProjectSummary: z
    .object({
      apiKey: z.object({ apiKeyHash: z.string(), apiKeyName: z.string() }),
      project: z.object({ createdAt: z.string(), name: z.string(), projectId: z.string() }),
      wallet: z.object({
        did: z.string(),
        didUrl: z.string(),
      }),
    })
    .optional(),
  session: z
    .object({
      sessionId: z.string(),
      consoleAuthToken: z.string(),
      account: z.object({
        label: z.string(),
        userId: z.string(),
      }),
      scopes: z.string().array(),
    })
    .optional(),
})

const config = z.object({
  version: z.number(),
  currentUserId: z.string().optional(),
  configs: z.record(z.optional(z.object({ activeProjectId: z.string() }))).optional(),
})

function isValidObject(objectType: any, object: any) {
  return objectType.safeParse(object).success
}

export function validateVaultFiles() {
  const isConfigValid = isValidObject(config, configVault.getObject())
  const isCredentialsValid = isValidObject(credentials, credentialsVault.getObject())

  if (!(isConfigValid && isCredentialsValid)) {
    credentialsVault.clear()
    configVault.clear()

    window.showErrorMessage(configMessage.invalidConfigFiles)
  }
}
