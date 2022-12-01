export function isValidSchemaType(value: string) {
  return /^[a-zA-Z0-9]{2,}$/.test(value)
}

export function isValidAttributeName(value: string) {
  return /^[a-zA-Z0-9_-]+$/.test(value)
}
