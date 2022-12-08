import { ProjectSummary } from '@affinidi/client-iam'
import { IssuanceDto } from '@affinidi/client-issuance'
import { SchemaDto } from '@affinidi/client-schema-manager'
import * as jwt from 'jsonwebtoken'
import { AuthenticationSession } from 'vscode'
import { EXAMPLE_SCHEMA } from '../../features/schema-manager/schemaManagerHelpers'

export function generateSession(values?: {
  id?: string
  accessToken?: string
}): AuthenticationSession {
  return {
    id: values?.id ?? 'fake-id',
    accessToken: values?.accessToken ?? 'fake-access-token',
    account: {
      id: 'fake-account-id',
      label: 'fake label',
    },
    scopes: [],
  }
}

export function generateConsoleAuthToken(values?: { userId?: string; username?: string }): string {
  return jwt.sign(
    {
      userId: values?.userId ?? 'fake-user-id',
      username: values?.username ?? 'fake-username',
      extra: 'fields',
    },
    Buffer.from('does-not-matter'),
  )
}

export const generateSchema = (input?: {
  id?: string
  description?: string
  jsonSchemaUrl?: string
  jsonLdContextUrl?: string
}): SchemaDto => ({
  id: input?.id ?? 'fake-schema-id',
  parentId: null,
  authorDid: 'did:fake:user',
  description: input?.description ?? null,
  createdAt: '2020-01-01T12:00:00.000Z',
  namespace: null,
  type: 'MySchema',
  version: 1,
  revision: 0,
  jsonSchemaUrl: input?.jsonSchemaUrl ?? 'https://schema.affinidi.com/MySchemaV1-0.json',
  jsonLdContextUrl: input?.jsonLdContextUrl ?? 'https://schema.affinidi.com/MySchemaV1-0.jsonld',
})

export const generateIssuance = ({
  id = 'fake-issuance-id',
  projectId = 'fake-project-id',
  issuerDid = 'fake-did',
  walletUrl = 'fake-wallet-url',
}): IssuanceDto => ({
  id,
  createdAt: 'Wed Nov 30 2022 13:27:11',
  template: {
    walletUrl,
    verification: {
      method: 'email',
    },
    schema: EXAMPLE_SCHEMA,
    issuerDid,
  },
  projectId,
})

export const generateProjectSummary = ({
  projectId = 'fake-project-id',
  projectName = 'fake-project-name',
  apiKeyHash = 'fake-api-key-hash',
  did = 'fake-did',
}): ProjectSummary => ({
  wallet: {
    didUrl: '',
    did,
  },
  apiKey: {
    apiKeyHash,
    apiKeyName: '',
  },
  project: {
    projectId,
    name: projectName,
    createdAt: '',
  },
})
