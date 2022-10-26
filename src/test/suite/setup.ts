import * as sourceMapSupport from "source-map-support";
import * as sinon from "sinon";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from 'chai-as-promised';
import * as deepEqualInAnyOrder from "deep-equal-in-any-order";

sourceMapSupport.install();

chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(deepEqualInAnyOrder);

export const sandbox = sinon.createSandbox();

beforeEach(() => {
  sandbox.restore();
});
