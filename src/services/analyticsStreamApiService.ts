import { authentication } from "vscode";
import { apiFetch } from "../api-client/api-fetch";
import { AUTH_PROVIDER_ID } from "../auth/authentication-provider/affinidi-authentication-provider";
import { isTelemetryEnabled } from "../utils/telemetry";

// TODO: This JWT_TOKEN is valid only for 180 days(until 24-04-2023). We need to re-generate the new token by this date.
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOTQ0MzY0ZS02NjcwLTQ4M2QtYjM3NC1hMDMyODQwYzliYjUiLCJ1c2VyTmFtZSI6ImFudXNoYS5rQGFmZmluaWRpLmNvbSIsImlhdCI6MTY2Njg4MjE4MywiZXhwIjoxNjgyNDM0MTgzfQ.dI3c9vy3xJu_SZVIUH9T2dbuuVXRuZv-qXs3lYXFrMU";
const ANALYTICS_STREAM_API_URL =
  "https://analytics-stream.prod.affinity-project.org";

export const enum EventNames {
  commandExecuted = "COMMAND_EXECUTED",
  snippetInserted = "SNIPPET_INSERTED",
  extensionInitialized = 'EXTENSION_INITIALIZED'
}

export const sendEventToAnalytics = async ({
  name,
  subCategory,
  metadata,
}: {
  name: EventNames;
  subCategory?: string;
  metadata?: any;
}): Promise<void> => {
  if (!isTelemetryEnabled()) {
    return;
  }

  const session = await authentication.getSession(AUTH_PROVIDER_ID, []);
  const uuid = session?.account?.id ?? "anonymous-user";

  await apiFetch({
    endpoint: `${ANALYTICS_STREAM_API_URL}/api/events`,
    method: "POST",
    requestBody: {
      name,
      category: "APPLICATION",
      subCategory,
      component: "VsCodeExtension",
      uuid,
      metadata,
    },
    headers: {
      authorization: `Bearer ${JWT_TOKEN}`,
    },
  });
};
