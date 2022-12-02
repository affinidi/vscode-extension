import { window, ProgressLocation } from 'vscode'
import { IssuanceDto, Options } from '@affinidi/client-issuance'
import { format } from 'date-fns'

import { showQuickPick } from '../../utils/showQuickPick'
import { getIssuances } from './getIssuances'
import { issuanceMessage } from '../../messages/messages'

type Input = { projectId: string }

export const getIssuanceName = (issuance: IssuanceDto) =>
  `${issuance.template.schema.type} at ${format(
    new Date(issuance.createdAt),
    'yyyy-MM-dd HH:mm',
  )} (${issuance.id})`

async function askForIssuance(input: Input, options: Options): Promise<IssuanceDto | undefined> {
  const issuances = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: issuanceMessage.fetchIssuances,
    },
    () => getIssuances(input.projectId, options),
  )

  if (issuances.length === 0) {
    throw new Error(issuanceMessage.noIssauces)
  }

  return showQuickPick([...issuances.map<[string, IssuanceDto]>((i) => [getIssuanceName(i), i])], {
    title: issuanceMessage.selectIssuance,
  })
}

export const issuanceHelpers = {
  askForIssuance,
  getIssuanceName,
}
