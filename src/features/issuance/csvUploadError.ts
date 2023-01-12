/* eslint-disable @typescript-eslint/no-explicit-any */
import { csvMessage } from './messages'

export type UploadError = {
  title: string
  row?: {
    title: string
    errors: string[]
  }
}

const getVIS19ErrorData = (error: any) => ({
  title: csvMessage.invalidCsvFile,
  row: {
    title: `${csvMessage.invalidDataInRow}${error.context.row}`,
    errors: error.context.errors.map((e: any) =>
      e.field ? `${csvMessage.field} "${e.field}" ${e.message}` : `${csvMessage.row} ${e.message}`,
    ),
  },
})

const getVIS20ErrorData = (error: any) => {
  const formatErrorTitlePrefix = error.context.possibleFormatError
    ? `${csvMessage.commaSeparatorMessage} `
    : ''

  return {
    title: csvMessage.invalidCsvFile,
    row: {
      title: `${formatErrorTitlePrefix}${csvMessage.couldNotFindAllColumns}`,
      errors:
        error.context.missingColumns?.length > 0
          ? [`${csvMessage.requiredColumns}: ${error.context.missingColumns.join(', ')}`]
          : [],
    },
  }
}

export function parseUploadError(error: any): UploadError | undefined {
  switch (error.code) {
    case 'VIS-1':
    case 'VIS-2':
    case 'VIS-14':
      return { title: error.message }
    case 'VIS-19':
      return getVIS19ErrorData(error)
    case 'VIS-20': {
      return getVIS20ErrorData(error)
    }
    default:
  }

  return undefined
}
