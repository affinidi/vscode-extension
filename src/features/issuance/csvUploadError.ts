import { csvMessage } from '../../messages/messages'

export type UploadError = {
  title: string
  row?: {
    title: string
    errors: string[]
  }
}

export function parseUploadError(error: any): UploadError | undefined {
  switch (error.code) {
    case 'VIS-1':
    case 'VIS-2':
    case 'VIS-14':
      return { title: error.message }
    case 'VIS-19':
      return {
        title: csvMessage.invalidCsvFile,
        row: {
          title: `${csvMessage.invalidDataInRow}${error.context.row}`,
          errors: error.context.errors.map((error: any) =>
            error.field
              ? `${csvMessage.field} "${error.field}" ${error.message}`
              : `${csvMessage.row} ${error.message}`,
          ),
        },
      }
    case 'VIS-20': {
      const formatErrorTitlePrefix = error.context.possibleFormatError
        ? csvMessage.commaSeparatorMessage
        : ''

      return {
        title: csvMessage.invalidCsvFile,
        row: {
          title: `${formatErrorTitlePrefix} ${csvMessage.couldNotFindAllColumns}`,
          errors:
            error.context.missingColumns?.length > 0
              ? [`${csvMessage.requiredColumns}: ${error.context.missingColumns.join(', ')}`]
              : [],
        },
      }
    }
    default:
  }

  return undefined
}
