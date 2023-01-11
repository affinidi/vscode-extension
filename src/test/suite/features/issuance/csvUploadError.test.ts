import { expect } from 'chai'

import { parseUploadError } from '../../../../features/issuance/csvUploadError'
import { csvMessage } from '../../../../features/issuance/messages'

describe('parseUploadError()', () => {
  it('should return provided error message', () => {
    const message = 'test message'

    expect(parseUploadError({ code: 'VIS-1', message })).to.deep.equal({ title: message })
    expect(parseUploadError({ code: 'VIS-2', message })).to.deep.equal({ title: message })
    expect(parseUploadError({ code: 'VIS-14', message })).to.deep.equal({ title: message })
  })

  it('should return formatted error message for VIS-19 error code', () => {
    const message = 'test message'
    const field = 'firstName'
    const message2 = 'second message'
    const data = parseUploadError({
      code: 'VIS-19',
      context: { errors: [{ field, message }, { message: message2 }] },
    })

    expect(data?.title).equal(csvMessage.invalidCsvFile)
    expect(data?.row?.errors).to.deep.equal([`Field "${field}" ${message}`, `Row ${message2}`])
  })

  it('should return formatted error message for VIS-20 error code', () => {
    const possibleFormatError = 'example possibleFormatError'
    const data = parseUploadError({
      code: 'VIS-20',
      context: { possibleFormatError, missingColumns: [1, 2] },
    })

    expect(data?.title).equal(csvMessage.invalidCsvFile)
    expect(data?.row?.title).equal(
      `${csvMessage.commaSeparatorMessage} ${csvMessage.couldNotFindAllColumns}`,
    )
    expect(data?.row?.errors).to.deep.equal([`${csvMessage.requiredColumns}: 1, 2`])

    const data1 = parseUploadError({
      code: 'VIS-20',
      context: {},
    })

    expect(data1?.title).equal(csvMessage.invalidCsvFile)
    expect(data1?.row?.title).equal(csvMessage.couldNotFindAllColumns)
    expect(data1?.row?.errors).to.deep.equal([])
  })
})
