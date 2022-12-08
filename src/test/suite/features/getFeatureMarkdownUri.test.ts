import { expect } from 'chai'
import { Feature } from '../../../features/feature'
import { getFeatureMarkdownUri } from '../../../features/getFeatureMarkdownUri'

describe('getFeatureMarkdownUri()', () => {
  it('should return path to schema manager markdown', async () => {
    const result = await getFeatureMarkdownUri(Feature.SCHEMAS)

    expect(result).equal('/document/vcSchemas.md')
  })

  it('should return path to bulk issuance markdown', async () => {
    const result = await getFeatureMarkdownUri(Feature.ISSUANCES)

    expect(result).equal('/document/issuance.md')
  })

  it('should throw an error if any other resource type provided', async () => {
    await expect(getFeatureMarkdownUri('unknown' as any)).to.be.rejected
  })
})
