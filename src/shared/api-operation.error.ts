type ErrorData = {
  code?: string
  message?: string
  httpStatusCode?: number
}

export class ApiOperationError extends Error {
  public readonly code?: string

  public readonly httpStatusCode?: number

  constructor(
    { code, message, httpStatusCode }: ErrorData,
    readonly context?: unknown,
    readonly originalError?: unknown,
  ) {
    super(message || code)
    this.code = code
    this.httpStatusCode = httpStatusCode
  }
}
