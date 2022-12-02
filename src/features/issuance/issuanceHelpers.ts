import { window, ProgressLocation, l10n } from 'vscode'
import { IssuanceDto, Options } from '@affinidi/client-issuance'
import { format } from 'date-fns'

import { showQuickPick } from '../../utils/showQuickPick'
import { issuanceState } from './issuanceState'

type Input = { projectId: string }

export const NO_ISSUANCES_ERROR_MESSAGE = l10n.t("You don't have any issuances to choose from")

export const getIssuanceName = (issuance: IssuanceDto) =>
  `${issuance.template.schema.type} at ${format(
    new Date(issuance.createdAt),
    'yyyy-MM-dd HH:mm',
  )} (${issuance.id})`

async function askForIssuance(input: Input): Promise<IssuanceDto | undefined> {
  const issuances = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Fetching available issuances...'),
    },
    () => issuanceState.listIssuances({ projectId: input.projectId }),
  )

  if (issuances.length === 0) {
    throw new Error(NO_ISSUANCES_ERROR_MESSAGE)
  }

  return showQuickPick([...issuances.map<[string, IssuanceDto]>((i) => [getIssuanceName(i), i])], {
    title: l10n.t('Select an Issuance'),
  })
}

export const issuanceHelpers = {
  askForIssuance,
  getIssuanceName,
}
