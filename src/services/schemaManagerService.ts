import {
  apiFetch,
  buildURL,
} from "../api-client/api-fetch";


export type SchemaEntity = {
  id: string;
  authorDid: string;
  createdAt: Date;
  description: string
  jsonLdContextUrl: string;
  jsonSchemaUrl: string;
  namespace: string | null;
  parentId: string | null;
  version: number;
  revision: number;
  type: string;
};

export type ResponseType = {
  count: number
  schemas: SchemaEntity[];
};

export const SCHEMA_MANAGER_API_BASE = 'https://affinidi-schema-manager.dev.affinity-project.org/api';

export const getPublicSchemas = async (): Promise<ResponseType> => {
  const url = buildURL(SCHEMA_MANAGER_API_BASE, "/v1/schemas", {
    scope: 'public',
    limit: '10'
  });
  
  return apiFetch({
    method: "GET",
    endpoint: url,
    // headers: {},
  });
};
