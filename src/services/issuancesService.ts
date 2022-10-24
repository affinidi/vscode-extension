import {
  apiFetch,
  buildURL,
  generateApiKeyHeader,
} from "../api-client/api-fetch";

export const ISSUANCE_API_BASE =
  "https://console-vc-issuance.dev.affinity-project.org/api";

export type VerificationMethod = "email";

export interface SchemaDescription {
  type: string;
  jsonLdContextUrl: string;
  jsonSchemaUrl: string;
}

export type IssuanceEntity = {
  id: string;
  projectId: string;
  template: {
    issuerDid: string;
    schema: SchemaDescription;
    verification: { method: VerificationMethod };
  };
  createdAt: Date;
};

export type IssuanceList = {
  issuances: IssuanceEntity[];
};

export type IssuanceListInput = {
  apiKeyHash: string;
  projectId: string;
};

export const getProjectIssuances = async (
  input: IssuanceListInput
): Promise<IssuanceList> => {
  const url = buildURL(ISSUANCE_API_BASE, "/v1/issuances", {
    projectId: input.projectId,
  });
  const response: IssuanceList = await apiFetch({
    method: "GET",
    endpoint: url,
    headers: generateApiKeyHeader(input.apiKeyHash),
  });
  return response;
};
