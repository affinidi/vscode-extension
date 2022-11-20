import { l10n } from 'vscode'

export function validateEmail(value: string) {
  const re = /\S+@\S+\.\S+/
  if (!re.test(value)) {
    return l10n.t('Enter a valid email address')
  }
  return undefined
}

export function validateOTP(value: string) {
  const re = /\b\d{6}\b/
  if (!re.test(value)) {
    return l10n.t('Confirmation code should be 6 digits')
  }
  return undefined
}
