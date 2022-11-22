import { expect } from 'chai'
import { generateSampleFromJsonSchema } from '../../../../features/issuance/json-schema/columnsToObject'

describe('generate Empty JSON object', () => {
  const credentialSubject = [
    { path: ['name', 'firstName'], type: 'string' },
    { path: ['name', 'lastName'], type: 'string' },
    { path: ['age'], type: 'integer' },
    { path: ['dateOfBirth'], type: 'unknown' },
  ]

  it.only('should convert columns to object', () => {
    return expect(generateSampleFromJsonSchema(credentialSubject)).to.eq({
      name: {
        firstName: '',
        lastName: '',
      },
      age: 0,
      dateOfBirth: null,
    })
  })
})
