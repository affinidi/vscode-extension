import * as vscode from "vscode";
import { ThemeIcon } from "vscode";
import { apiFetch } from "../api-client/api-fetch";
import AffResourceTreeItem from "../treeView/treeItem";
import { AffinidiVariantTypes } from "../affinidiVariant";

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

export type SubmitBulkUploadParam = {
  projectId: string;
  schemaURL: string;
  issuer: { did: string };
};

export type ResponseType = {
  issuances: IssuanceEntity[];
};

class IssuanceService {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKeyHash: string,
    private readonly projectId: string
  ) {}

  async getAllIssuances(): Promise<AffResourceTreeItem> {
    const url = this.buildURL("/issuances", { projectId: this.projectId });
    const response: ResponseType = await apiFetch({
      method: "GET",
      endpoint: url,
      headers: this.generateAuthHeaders(),
    });

    return new AffResourceTreeItem(
      AffinidiVariantTypes[AffinidiVariantTypes.issuance],
      response.issuances[0].id,
      response.issuances[0].id,
      "",
      vscode.TreeItemCollapsibleState.None,
      new ThemeIcon("output")
    );
  }

  generateAuthHeaders(): Record<string, string> {
    return { "Api-Key": this.apiKeyHash };
  }

  private buildURL(
    path: string,
    qs?: string[][] | Record<string, string> | string | URLSearchParams
  ): string {
    //@ts-ignore
    const search = new URLSearchParams(qs).toString();
    const url = `${this.baseUrl}${path}${search ? "?" + search : ""}`;

    return new URL(url).toString();
  }
}

export default IssuanceService;
