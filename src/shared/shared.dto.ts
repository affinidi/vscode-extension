import { ExpressRequestWithAuthentication } from '@affinidi/common-auth'

export type ExtendedRequest = ExpressRequestWithAuthentication

export interface AnyObject {
  [key: string]: unknown
}

export interface OperationErrorType {
  code: string
  message: string
}
