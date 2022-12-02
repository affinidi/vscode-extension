import { expect } from 'chai'
import { viewMarkdown } from '../../../services/markdownService'
import { ExplorerResourceTypes } from '../../../tree/types'

describe('viewMarkdown()', () => {
  it('should return path to schema manager markdown', () => {
    const result = viewMarkdown(ExplorerResourceTypes.rootSchemas)

    expect(result).equal('/document/schemaManager.md')
  })

  it('should return path to bulk issuance markdown', () => {
    const result = viewMarkdown(ExplorerResourceTypes.rootIssuance)

    expect(result).equal('/document/bulkIssuance.md')
  })

  it('should throw an error if any other resource type provided', () => {
    try {
      viewMarkdown(ExplorerResourceTypes.project)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(error.message).contain('Unexpected resource type')
    }
  })
})
