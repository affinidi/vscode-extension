import { window, ProgressLocation, l10n } from 'vscode'
import { Options } from '@affinidi/client-issuance'
import { showQuickPick } from '../../utils/showQuickPick'
import { formatIssuanceName } from './formatIssuanceName'
import { getIssuances } from './getIssuances'

type Input = { projectId: string }

async function askForIssuanceId(input: Input, options: Options): Promise<string | undefined> {
  const issuances = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Fetching available issuances...'),
    },
    () => getIssuances(input.projectId, options),
  )

  if (issuances.length === 0) {
    throw new Error(l10n.t("You don't have any issuances to choose from"))
  }

  return showQuickPick(
    [
      ...issuances.map<[string, string]>((issuance) => [
        `${formatIssuanceName(issuance)} (${issuance.id})`,
        issuance.id,
      ]),
    ],
    { title: l10n.t('Select an Issuance') },
  )
}

export const issuanceHelper = {
  askForIssuanceId,
}
