import { expect } from 'chai'

import { validateEmail, validateOTP } from '../../../../auth/authentication-provider/validators'
import { authMessage } from '../../../../messages/messages'

describe('validators', () => {
  describe('validateEmail()', () => {
    it('should return an error message of email is not valid', () => {
      expect(validateEmail('test')).equal(authMessage.invalidEmailAddress)
      expect(validateEmail('test@test')).equal(authMessage.invalidEmailAddress)
      expect(validateEmail('test@test')).equal(authMessage.invalidEmailAddress)
    })

    it('should do nothing if value is valid', () => {
      expect(validateEmail('test@test.test')).equal(undefined)
    })
  })

  describe('validateOTP()', () => {
    it('should return an error message of OTP is not valid', () => {
      expect(validateOTP('test')).equal(authMessage.confirmationCodeShouldBeSixDigits)
      expect(validateOTP('11')).equal(authMessage.confirmationCodeShouldBeSixDigits)
      expect(validateOTP('1232test')).equal(authMessage.confirmationCodeShouldBeSixDigits)
      expect(validateOTP('1234567')).equal(authMessage.confirmationCodeShouldBeSixDigits)
    })

    it('should do nothing if value is valid', () => {
      expect(validateOTP('123456')).equal(undefined)
    })
  })
})
