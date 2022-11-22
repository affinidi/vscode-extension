import { OperationError as _OperationError } from '@affinidi/affinity-common-backend'

const root = process.cwd()
const path = `${root}/config/errors.yaml`

const OperationError = _OperationError.buildOperationErrorClassSync(path)

export default OperationError
