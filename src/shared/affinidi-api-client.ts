import nodeFetch from 'node-fetch'
import { ApiOperationError } from './api-operation.error'

export class AffinidiApiClient {
  constructor(private readonly apiUrl: string) {}

  async fetch<T = unknown>({
    method,
    endpoint,
    requestBody,
    headers,
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    endpoint: string
    requestBody?: unknown
    headers?: Record<string, string>
  }): Promise<T> {
    const response = await nodeFetch(`${this.apiUrl}${endpoint}`, {
      method,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
      headers: {
        ...(requestBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
    })
    const { status: statusCode } = response

    if (statusCode === 204 || statusCode === 201) {
      // @ts-ignore
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
}
