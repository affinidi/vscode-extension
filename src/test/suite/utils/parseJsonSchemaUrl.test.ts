import { expect } from 'chai'

import { errorMessage } from '../../../messages/messages'
import { parseJsonSchemaUrl } from '../../../utils/parseJsonSchemaUrl'

describe('parseJsonSchemaUrl()', () => {
  it('should throw an error if value not a valid url', () => {
    let value = ''

    expect(() => parseJsonSchemaUrl(value)).to.throw(
      `${errorMessage.invalidJsonSchemaUrl} ${value}`,
    )

    value = 'example'

    expect(() => parseJsonSchemaUrl(value)).to.throw(
      `${errorMessage.invalidJsonSchemaUrl} ${value}`,
    )

    value = 'htt://test.com'

    expect(() => parseJsonSchemaUrl(value)).to.throw(
      `${errorMessage.invalidJsonSchemaUrl} ${value}`,
    )
  })

  it('should return provided value if url is valid', () => {
    let value = 'http://test.com'

    expect(value).equal(value)

    value = 'https://test.com'

    expect(value).equal(value)
  })
})
