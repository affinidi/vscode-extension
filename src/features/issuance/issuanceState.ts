import { IssuanceDto } from '@affinidi/client-issuance'
import { ProgressLocation, window } from 'vscode'
import { ext } from '../../extensionVariables'
import { issuanceMessage } from '../../messages/messages'
import { stateHelpers } from '../../stateHelpers'
import { reusePromise } from '../../utils/reusePromise'
import { iamState } from '../iam/iamState'
import { issuanceClient } from './issuanceClient'

const PREFIX = 'issuance:'
const storageKey = (input: string) => PREFIX + input

export class IssuanceState {
  async listIssuances(input: { projectId: string }): Promise<IssuanceDto[]> {
    return this.fetchIssuancesByProject(input.projectId)
  }

  async getIssuanceById(input: {
    projectId: string
    issuanceId: string
  }): Promise<IssuanceDto | undefined> {
    return (await this.fetchIssuancesByProject(input.projectId)).find(
      (i) => i.id === input.issuanceId,
    )
  }

  clear() {
    stateHelpers.clearByPrefix(PREFIX)
  }

  private fetchIssuancesByProject = reusePromise(
    async (projectId: string): Promise<IssuanceDto[]> => {
      const key = storageKey(`by-project:${projectId}`)
      const stored = stateHelpers.get<IssuanceDto[]>(key)
      if (stored) return stored

      const projectSummary = await iamState.requireProjectSummary(projectId)
      const { issuances } = await window.withProgress(
        { location: ProgressLocation.Notification, title: issuanceMessage.fetchingIssuances },
        async () =>
          issuanceClient.searchIssuances(
            { projectId },
            { apiKeyHash: projectSummary.apiKey.apiKeyHash },
          ),
      )

      stateHelpers.update(key, issuances)

      return issuances
    },
  )
}

export const issuanceState = new IssuanceState()
