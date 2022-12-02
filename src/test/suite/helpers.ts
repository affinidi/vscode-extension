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


export const generateSchema = (): SchemaDto => ({
  id: '1',
  parentId: null,
  authorDid: '',
  description: null,
  createdAt: '',
  namespace: null,
  type: 'Test schema',
  version: 1,
  revision: 0,
  jsonSchemaUrl: 'jsonSchemaUrlTest',
  jsonLdContextUrl: 'jsonLdContextUrlTest',
})

export const generateIssuance = ({
  projectId = 'fake-project-id',
  issuerDid = 'fake-did',
}): IssuanceDto => ({
  id: '1',
  createdAt: 'Wed Nov 30 2022 13:27:11',
  template: {
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
