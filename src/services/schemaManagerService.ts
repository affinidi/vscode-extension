import { authentication } from "vscode";
import { apiFetch, buildURL } from "../api-client/api-fetch";
import { AUTH_PROVIDER_ID } from "../auth/authentication-provider/affinidi-authentication-provider";
import { ext } from "../extensionVariables";

export type SchemaEntity = {
  id: string;
  authorDid: string;
  createdAt: Date;
  description: string;
  jsonLdContextUrl: string;
  jsonSchemaUrl: string;
  namespace: string | null;
  parentId: string | null;
  version: number;
  revision: number;
  type: string;
};

export type SchemaSearchScope = "public" | "unlisted" | "default";

export type ResponseType = {
  count: number;
  schemas: SchemaEntity[];
};

export const SCHEMA_MANAGER_API_BASE =
  "https://api.affinidi.com/schema-manager/v1";

export const getPublicSchemas = async (): Promise<ResponseType> => {
  const url = buildURL(SCHEMA_MANAGER_API_BASE, "/schemas", {
    scope: "public",
    limit: "10",
  });

  return apiFetch({
    method: "GET",
    endpoint: url,
  });
};

type GetMySchemasProps = {
  did: string;
  scope?: SchemaSearchScope;
};

export const getMySchemas = async ({
  did,
  scope = "default",
}: GetMySchemasProps): Promise<ResponseType> => {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  });

  const url = buildURL(SCHEMA_MANAGER_API_BASE, "/schemas", {
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

export const getSchema = async (schemaId: string): Promise<SchemaEntity | undefined> => {
  const url = buildURL(SCHEMA_MANAGER_API_BASE, `/schemas/${schemaId}`);

  try {
    return await apiFetch({
      method: "GET",
      endpoint: url,
    });
  } catch (error: any) {
    if (error.code === 'SCH-9') {
      return undefined;
    }

    throw error;
  }
};
