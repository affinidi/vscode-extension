import { expect } from 'chai'
import { columnsToObject } from '../../../../features/issuance/json-schema/columnsToObject'
import { ColumnSpec } from '../../../../features/issuance/json-schema/generate-empty-json-specs'

describe('columnsToObject()', () => {
  const columns: ColumnSpec[] = [
    { path: ['name', 'firstName'], type: 'string', required: false },
    { path: ['name', 'lastName'], type: 'string', required: true },
    { path: ['age'], type: 'integer', required: false },
    { path: ['dateOfBirth'], type: 'unknown', required: false },
    { path: ['personalInfo', 'favoriteNumber'], type: 'number', required: false },
    { path: ['personalInfo', 'isDeveloper'], type: 'boolean', required: true },
  ]

  it('should convert columns to object', () => {
    expect(columnsToObject(columns)).to.deep.eq({
      name: {
        firstName: '',
        lastName: '',
      },
      personalInfo: {
        favoriteNumber: 0,
        isDeveloper: false,
      },
      age: 0,
      dateOfBirth: null,
    })
  })
})
