import { ProjectSummary } from '@affinidi/client-iam'
import { ext } from '../../extensionVariables'

const storageKey = 'activeProjectSummary'

export class ActiveProject {
  getActiveProjectSummary = (): ProjectSummary | undefined => {
    return ext.context.globalState.get(storageKey)
  }

  setActiveProjectSummary = (projectSummary: ProjectSummary): void => {
    ext.context.globalState.get(storageKey, projectSummary)
  }
}

export const activeProjectState = new ActiveProject()
