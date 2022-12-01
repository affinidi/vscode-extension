import { ProjectSummary } from '@affinidi/client-iam'
import { IssuanceDto } from '@affinidi/client-issuance'
import { SchemaDto } from '@affinidi/client-schema-manager'

import { EXAMPLE_SCHEMA } from '../../../features/schema-manager/schemaManagerHelpers'

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
