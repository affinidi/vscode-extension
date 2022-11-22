import OperationError from '../OperationError'

function isValidHttpUrl(str: string | undefined): boolean {
  let url

  try {
    url = new URL(str)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export function parseJsonSchemaUrl(str: string): URL {
  if (!isValidHttpUrl(str)) {
    throw new OperationError('VIS-16')
  }

  return new URL(str)
}
