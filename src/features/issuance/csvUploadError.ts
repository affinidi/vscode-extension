import { l10n } from 'vscode'
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
              ? l10n.t(`Field "${error.field}" ${error.message}`)
              : l10n.t(`Row ${error.message}`),
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
              ? [`${l10n.t('Required columns: ')} ${error.context.missingColumns.join(', ')}`]
              : [],
        },
      }
    }
    default:
  }

  return undefined
}
