import { expect } from 'chai'
import { columnsToObject } from '../../../../features/issuance/json-schema/columnsToObject'
import { ColumnSpec } from '../../../../features/issuance/json-schema/generate-empty-json-specs'

describe('columnsToObject()', () => {
  const columns: ColumnSpec[] = [
    { path: ['name', 'firstName'], type: 'string', required: false },
    { path: ['name', 'lastName'], type: 'string', required: true },
    { path: ['age'], type: 'integer', required: false },
    { path: ['dateOfBirth'], type: 'unknown', required: false },
  ]

  it.only('should convert columns to object', () => {
    return expect(columnsToObject(columns)).to.eq({
      name: {
        firstName: '',
        lastName: '',
      },
      age: 0,
      dateOfBirth: null,
    })
  })
})
