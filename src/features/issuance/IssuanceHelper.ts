import { window, ProgressLocation } from 'vscode'
import { Options } from '@affinidi/client-issuance'
import { showQuickPick } from '../../utils/showQuickPick'
import { formatIssuanceName } from './formatIssuanceName'
import { getIssuances } from './getIssuances'
import { issuanceMessage } from '../../messages/messages'

type Input = { projectId: string }

async function askForIssuanceId(input: Input, options: Options): Promise<string | undefined> {
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
    [
      ...issuances.map<[string, string]>((issuance) => [
        `${formatIssuanceName(issuance)} (${issuance.id})`,
        issuance.id,
      ]),
    ],
    { title: `${issuanceMessage.selectIssuance}` },
  )
}

export const issuanceHelper = {
  askForIssuanceId,
}
