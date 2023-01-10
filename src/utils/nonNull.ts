import { errorMessage } from './messages'

/**
 * Validates that a given value is not null and not undefined.
 */
export function nonNull<T>(value: T | undefined, propertyNameOrMessage: string): T {
  if (value === undefined || value === null) {
    throw new Error(`${errorMessage.internalErrorNullOrUndefined} ${propertyNameOrMessage}`)
  }
  return value
}
