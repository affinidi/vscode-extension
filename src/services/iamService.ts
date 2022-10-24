import { authentication } from "vscode";
import { apiFetch } from "../api-client/api-fetch";
import { AUTH_PROVIDER_ID } from "../auth/authentication-provider/affinidi-authentication-provider";

const IAM_API_BASE = "https://affinidi-iam.dev.affinity-project.org/api";

export type Project = {
  name: string;
  projectId: string;

  /** @format date-time */
  createdAt: string;
};

export type ProjectList = {
  projects: Project[];
};

export type ProjectSummary = {
  apiKey: { apiKeyHash: string; apiKeyName: string };
  project: Project;
  wallet: { didUrl: string; did: string };
};

export const getProjects = async (): Promise<ProjectList> => {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: true,
  });
  return await apiFetch<ProjectList>({
    endpoint: `${IAM_API_BASE}/v1/projects`,
    method: "GET",
    headers: {
      cookie: session.accessToken,
    },
  });
};

export const getProjectSummary = async (
  projectId: string
): Promise<ProjectSummary> => {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: true,
  });
  return await apiFetch<ProjectSummary>({
    endpoint: `${IAM_API_BASE}/v1/projects/${projectId}/summary`,
    method: "GET",
    headers: {
      cookie: session.accessToken,
    },
  });
};