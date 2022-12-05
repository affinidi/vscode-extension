import { ProjectSummary } from '@affinidi/client-iam'
import { ext } from '../../extensionVariables'
import { state } from '../../state'

const storageKey = 'activeProjectSummary'

export class ActiveProject {
  getActiveProjectSummary = (): ProjectSummary | undefined => {
    return ext.context.globalState.get(storageKey)
  }

  setActiveProjectSummary = (projectSummary: ProjectSummary): void => {
    ext.context.globalState.get(storageKey, projectSummary)
  }

  async clear() {
    await state.clear(storageKey)
  }
}

export const activeProjectState = new ActiveProject()
