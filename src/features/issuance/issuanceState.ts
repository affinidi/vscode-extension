import { IssuanceDto } from '@affinidi/client-issuance'
import { ProgressLocation, window } from 'vscode'
import { issuanceMessage } from './messages'
import { state } from '../../state'
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
    state.clearByPrefix(PREFIX)
  }

  private async fetchIssuancesByProject(projectId: string): Promise<IssuanceDto[]> {
    const key = storageKey(`by-project:${projectId}`)
    const stored = state.get<IssuanceDto[]>(key)

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

    state.update(key, issuances)

    return issuances
  }
}

export const issuanceState = new IssuanceState()
