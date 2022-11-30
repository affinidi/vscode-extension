import { window, ProgressLocation, l10n } from 'vscode'
import { IssuanceDto } from '@affinidi/client-issuance'
import { showQuickPick } from '../../utils/showQuickPick'
import { formatIssuanceName } from './formatIssuanceName'
import { issuanceState } from './issuanceState'

type Input = { projectId: string }

async function askForIssuance(input: Input): Promise<IssuanceDto | undefined> {
  const issuances = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t('Fetching available issuances...'),
    },
    () => issuanceState.listIssuances({ projectId: input.projectId }),
  )

  if (issuances.length === 0) {
    throw new Error(l10n.t("You don't have any issuances to choose from"))
  }

  return showQuickPick(
    [...issuances.map<[string, IssuanceDto]>((i) => [`${formatIssuanceName(i)} (${i.id})`, i])],
    { title: l10n.t('Select an Issuance') },
  )
}

export const issuanceHelper = {
  askForIssuance,
}
