import { AffinidiApiClient } from '../../shared/affinidi-api-client'

// TODO: This JWT_TOKEN is valid only for 180 days(until 24-04-2023). We need to re-generate the new token by this date.
const JWT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOTQ0MzY0ZS02NjcwLTQ4M2QtYjM3NC1hMDMyODQwYzliYjUiLCJ1c2VyTmFtZSI6ImFudXNoYS5rQGFmZmluaWRpLmNvbSIsImlhdCI6MTY2Njg4MjE4MywiZXhwIjoxNjgyNDM0MTgzfQ.dI3c9vy3xJu_SZVIUH9T2dbuuVXRuZv-qXs3lYXFrMU'
const ANALYTICS_STREAM_API_URL = 'https://analytics-stream.prod.affinity-project.org'

export class AnalyticsStreamApi {
  constructor(private readonly apiClient: AffinidiApiClient) {}

  async sendEvent(input: {
    uuid: string
    name: string
    category: string
    component: string
    subCategory?: string
    metadata?: object
  }): Promise<void> {
    await this.apiClient.fetch({
      endpoint: '/api/events',
      method: 'POST',
      requestBody: {
        name: input.name,
        category: input.category,
        subCategory: input.subCategory,
        component: input.component,
        uuid: input.uuid,
        metadata: input.metadata,
      },
      headers: {
        authorization: `Bearer ${JWT_TOKEN}`,
      },
    })
  }
}

export const analyticsStreamApi = new AnalyticsStreamApi(
  new AffinidiApiClient(ANALYTICS_STREAM_API_URL),
)
