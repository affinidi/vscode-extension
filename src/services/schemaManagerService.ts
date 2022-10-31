import { authentication } from "vscode";

import {
  apiFetch,
  buildURL,
} from "../api-client/api-fetch";
import { AUTH_PROVIDER_ID } from "../auth/authentication-provider/affinidi-authentication-provider";


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

export type SchemaSearchScope = 'public' | 'unlisted' | 'default';

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
  });
};


type GetMySchemasProps = {
  did: string
  scope?: SchemaSearchScope
};

export const getMySchemas = async ({ did, scope = 'default' }: GetMySchemasProps): Promise<ResponseType> => {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: true,
  });

  const url = buildURL(SCHEMA_MANAGER_API_BASE, "/v1/schemas", {
    did,
    authorDid: did,
    scope,
  });

  return apiFetch({
    method: "GET",
    endpoint: url,
    headers: {
      cookie: session.accessToken,
    },
  });
};

export const getSchema = async (schemaId: string): Promise<SchemaEntity> => {
  const url = buildURL(SCHEMA_MANAGER_API_BASE, `/v1/schemas/${schemaId}`);
  return apiFetch({
    method: "GET",
    endpoint: url,
  });
};
