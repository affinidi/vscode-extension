import nodeFetch from 'node-fetch'
import { ApiOperationError } from './api-operation.error'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const CONTENT_TYPE_HEADER = 'Content-Type'

export const apiFetch = async <T = unknown>({
  method,
  endpoint,
  requestBody,
  headers,
}: {
  method: HttpMethod
  endpoint: string
  requestBody?: unknown
  headers?: Record<string, string>
}): Promise<T | undefined> => {
  const response = await nodeFetch(endpoint, {
    method,
    body: requestBody ? JSON.stringify(requestBody) : undefined,
    headers: {
      ...(requestBody ? { [CONTENT_TYPE_HEADER]: 'application/json' } : {}),
      ...headers,
    },
  })
  const { status: statusCode } = response

  if (statusCode === 204 || statusCode === 201) {
    return undefined
  }

  const json = await response.json()

  if (!String(statusCode).startsWith('2')) {
    const error = json
    const { code, message, context, httpStatusCode } = error

    throw new ApiOperationError(
      {
        code,
        message,
        httpStatusCode: httpStatusCode || statusCode,
      },
      context,
      error,
    )
  }

  return json
}
