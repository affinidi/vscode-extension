import { window, ProgressLocation } from 'vscode'
import { IssuanceDto, Options } from '@affinidi/client-issuance'
import { showQuickPick } from '../../utils/showQuickPick'
import { formatIssuanceName } from './formatIssuanceName'
import { getIssuances } from './getIssuances'
import { issuanceMessage } from '../../messages/messages'

type Input = { projectId: string }

async function askForIssuance(input: Input, options: Options): Promise<IssuanceDto | undefined> {
  const issuances = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `${issuanceMessage.fetchIssuances}`,
    },
    () => getIssuances(input.projectId, options),
  )

  if (issuances.length === 0) {
    throw new Error(issuanceMessage.noIssauces)
  }

  return showQuickPick(
    [...issuances.map<[string, IssuanceDto]>((i) => [`${formatIssuanceName(i)} (${i.id})`, i])],
    { title: `${issuanceMessage.selectIssuance}` },
  )
}

export const issuanceHelper = {
  askForIssuance,
}
