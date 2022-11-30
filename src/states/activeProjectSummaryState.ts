import { ProjectSummary } from '@affinidi/client-iam'

import { ext } from '../extensionVariables'

const STORAGE_KEY = 'activeProjectSummary'

const getActiveProjectSummary = (): ProjectSummary | undefined => {
  return ext.context.globalState.get(STORAGE_KEY)
}

const setActiveProjectSummary = (projectSummary: ProjectSummary): void => {
  ext.context.globalState.get(STORAGE_KEY, projectSummary)
}

const clear = () => {
  ext.context.globalState.update(STORAGE_KEY, undefined)
}

export const activeProjectSummaryState = {
  getActiveProjectSummary,
  setActiveProjectSummary,
  clear,
}
