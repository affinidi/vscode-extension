import { l10n } from 'vscode'

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
        title: l10n.t(`Invalid CSV file`),
        row: {
          title: l10n.t(`Invalid data in row #${error.context.row}`),
          errors: error.context.errors.map((error: any) =>
            error.field
              ? l10n.t(`Field "${error.field}" ${error.message}`)
              : l10n.t(`Row ${error.message}`),
          ),
        },
      }
    case 'VIS-20': {
      const formatErrorTitlePrefix = error.context.possibleFormatError
        ? l10n.t('Make sure to use comma (,) as separator. ')
        : ''

      return {
        title: l10n.t(`Invalid CSV file`),
        row: {
          title: `${formatErrorTitlePrefix}${l10n.t('Could not find all required columns')}`,
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
