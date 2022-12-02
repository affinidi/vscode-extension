import { authMessage } from '../../messages/messages'

export function validateEmail(value: string) {
  const re = /\S+@\S+\.\S+/
  if (!re.test(value)) {
    return authMessage.vaidEmailAddress
  }
}

export function validateOTP(value: string) {
  const re = /\b\d{6}\b/
  if (!re.test(value)) {
    return authMessage.confirmationCodeShouldBeSixDigits
  }
}
