import sourceMapSupport from 'source-map-support'
import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import deepEqualInAnyOrder from 'deep-equal-in-any-order'

sourceMapSupport.install()

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(deepEqualInAnyOrder)

export const sandbox = sinon.createSandbox()

beforeEach(() => {
  sandbox.restore()
})
