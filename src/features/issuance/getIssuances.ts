import { Options } from '@affinidi/client-schema-manager'
import { issuancesState } from '../../states/issuancesState'
import { issuanceClient } from './issuanceClient'

export const getIssuances = async (projectId: string, options: Options) => {
  let issuances = issuancesState.getIssuances()

  if (!issuances?.length) {
    const result = await issuanceClient.searchIssuances(
      {
        projectId,
      },
      options,
    )

    issuances = result.issuances

    issuancesState.setIssuances(issuances)
  }

  return issuances
}
