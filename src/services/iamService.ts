import { apiFetch } from '../api-client/api-fetch'
import { ext } from '../extensionVariables'

export const IAM_API_BASE = 'https://affinidi-iam.apse1.affinidi.com/api'

export type Project = {
  name: string
  projectId: string

  /** @format date-time */
  createdAt: string
}

export type ProjectList = {
  projects: Project[]
}

export type ProjectSummary = {
  apiKey: { apiKeyHash: string; apiKeyName: string }
  project: Project
  wallet: { didUrl: string; did: string }
}

export const getProjects = async (): Promise<ProjectList> => {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  })

  return apiFetch<ProjectList>({
    endpoint: `${IAM_API_BASE}/v1/projects`,
    method: 'GET',
    headers: {
      cookie: session.accessToken,
    },
  })
}

const getProjectSummary = async (projectId: string): Promise<ProjectSummary> => {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  })

  return apiFetch<ProjectSummary>({
    endpoint: `${IAM_API_BASE}/v1/projects/${projectId}/summary`,
    method: 'GET',
    headers: {
      cookie: session.accessToken,
    },
  })
}

export const createProject = async (projectName: string): Promise<void> => {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  })

  await apiFetch<void>({
    endpoint: `${IAM_API_BASE}/v1/projects`,
    method: 'POST',
    requestBody: {
      name: projectName,
    },
    headers: {
      cookie: session.accessToken,
    },
  })
}

export const iamService = {
  getProjects,
  getProjectSummary,
  createProject,
}
