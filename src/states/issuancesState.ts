import { IssuanceDto } from '@affinidi/client-issuance'

import { ext } from '../extensionVariables'

const STORAGE_KEY = 'issuance'

const getIssuances = (): IssuanceDto[] | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const getIssuanceById = (id?: string): IssuanceDto | undefined => {
  const issuances = getIssuances()
  const selectedIssuance = issuances?.find((Issuance) => Issuance?.id === id)

  return selectedIssuance
}

const setIssuances = (newIssuances: IssuanceDto[]) => {
  const issuances = getIssuances() || []

  ext.context.globalState.update(STORAGE_KEY, [...issuances, ...newIssuances])
}

const clear = () => {
  ext.context.globalState.update(STORAGE_KEY, undefined)
}

export const issuancesState = {
  setIssuances,
  getIssuances,
  getIssuanceById,
  clear,
}
