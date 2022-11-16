import fetch from 'node-fetch'
import * as fs from 'fs'
import { apiFetch, buildURL, generateApiKeyHeader } from '../api-client/api-fetch'
import { Schema } from '../shared/types'

const FormData = require('form-data')

export const ISSUANCE_API_BASE = 'https://console-vc-issuance.apse1.affinidi.com/api'

export type VerificationMethod = 'email'

export interface SchemaDescription {
  type: string
  jsonLdContextUrl: string
  jsonSchemaUrl: string
}

export type IssuanceEntity = {
  id: string
  projectId: string
  template: {
    issuerDid: string
    schema: SchemaDescription
    verification: { method: VerificationMethod }
  }
  createdAt: Date
}

export type IssuanceList = {
  issuances: IssuanceEntity[]
}

export type IssuanceListInput = {
  apiKeyHash: string
  projectId: string
}

export type TemplateInput = {
  apiKeyHash: string
  jsonSchemaUrl: string
}

export type SubmitBulkUploadParam = {
  apiKeyHash: string
  projectId: string
  issuance: IssuanceEntity
  schema?: Schema
  issuer: { did: string }
}

type SubmitBulkIssuanceResponse = {
  issuance: {
    id: string
  }
}

export const getProjectIssuances = async (input: IssuanceListInput): Promise<IssuanceList> => {
  const url = buildURL(ISSUANCE_API_BASE, '/v1/issuances', {
    projectId: input.projectId,
  })
  const response: IssuanceList = await apiFetch({
    method: 'GET',
    endpoint: url,
    headers: generateApiKeyHeader(input.apiKeyHash),
  })
  return response
}

export const getCsvTemplate = async (
  input: TemplateInput,
  verificationMethod: VerificationMethod,
): Promise<string> => {
  const url = buildURL(ISSUANCE_API_BASE, '/v1/issuances/csv-template', {
    jsonSchemaUrl: input.jsonSchemaUrl,
    verificationMethod,
  })

  const response = await fetch(url, {
    method: 'GET',
    headers: generateApiKeyHeader(input.apiKeyHash),
  })

  return response.text()
}

export const createIssuanceFromCsv = async (
  file: string,
  payload: {
    apiKeyHash: string
    projectId: string
    issuerDid: string
    schema: SchemaDescription
  },
): Promise<SubmitBulkIssuanceResponse> => {
  const formData = new FormData()
  formData.append('offers', fs.createReadStream(file))
  formData.append(
    'issuance',
    JSON.stringify({
      projectId: payload.projectId,
      template: {
        issuerDid: payload.issuerDid,
        schema: {
          type: payload.schema?.type,
          jsonLdContextUrl: payload.schema?.jsonLdContextUrl,
          jsonSchemaUrl: payload.schema?.jsonSchemaUrl,
        },
        verification: {
          method: 'email',
        },
      },
    }),
  )

  const response = await fetch(buildURL(ISSUANCE_API_BASE, '/v1/issuances/create-from-csv'), {
    method: 'POST',
    body: formData,
    headers: generateApiKeyHeader(payload.apiKeyHash),
  })

  const data = await response.json()
  return data
}
