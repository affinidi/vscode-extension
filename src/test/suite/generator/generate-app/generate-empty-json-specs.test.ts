import { expect } from 'chai'
import { columnsToObject } from '../../../../features/issuance/json-schema/generate-empty-json-specs'

describe('generate Empty JSON object', () => {
  const credentialSubject = [
    { path: ['name', 'firstName'], type: 'string' },
    { path: ['name', 'lastName'], type: 'string' },
    { path: ['age'], type: 'integer' },
    { path: ['dateOfBirth'], type: 'unknown' },
  ]

  it.only('should convert columns to object', () => {
    return expect(columnsToObject(credentialSubject)).to.eq({
      name: {
        firstName: '',
        lastName: '',
      },
      age: 0,
      dateOfBirth: null,
    })
  })
})
