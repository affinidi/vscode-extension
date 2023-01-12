import { expect } from 'chai'

import { errorMessage } from '../../../utils/messages'
import { nonNull } from '../../../utils/nonNull'

const propertyName = 'property'

describe('nonNull()', () => {
  it('should throw en error when value equals to undefined/null', () => {
    expect(() => nonNull(undefined, propertyName)).to.throw(
      `${errorMessage.internalErrorNullOrUndefined} ${propertyName}`,
    )
    expect(() => nonNull(null, propertyName)).to.throw(
      `${errorMessage.internalErrorNullOrUndefined} ${propertyName}`,
    )
  })

  it('should return provided value if not equals undefined/null', () => {
    expect(nonNull('', propertyName)).equal('')
    expect(nonNull(1, propertyName)).equal(1)
    expect(nonNull(true, propertyName)).equal(true)
  })
})
