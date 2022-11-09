import { ProgressLocation, window } from "vscode";
import { iamService } from "../../services/iamService";
import { ISSUANCE_API_BASE } from "../../services/issuancesService";
import { Schema } from "../../shared/types";
import { Implementations } from "../shared/createSnippetTools";
import { askForProjectId } from "../shared/askForProjectId";
import * as javascript from "./javascript";
import * as typescript from "./typescript";
import { createSnippetCommand } from "../shared/createSnippetCommand";
import { askForMySchema } from '../shared/askForMySchema';

export interface SnippetInput {
  issuanceApiUrl: string;
  apiKeyHash: string;
  projectId: string;
  issuerDid: string;
  schema: Schema;
  email?: string;
}

export interface CommandInput {
  projectId?: string;
  schema?: Schema;
  email?: string;
}

export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
};

export const insertSendVcOfferToEmailSnippet = createSnippetCommand<
  SnippetInput,
  CommandInput
>("sendVcOfferToEmail", "vcOffer", implementations, async (input) => {
  const projectId = input?.projectId ?? (await askForProjectId());
  if (!projectId) {
    return;
  }

  const {
    apiKey: { apiKeyHash },
    wallet: { did },
  } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Fetching project information...",
    },
    () => iamService.getProjectSummary(projectId)
  );

  const schema = input?.schema ?? (await askForMySchema({ did, apiKeyHash }));
  if (!schema) {
    return;
  }

  const email =
    input?.email ??
    (await window.showInputBox({
      prompt: "Enter an email to send the VC offer to",
    }));

  return {
    issuanceApiUrl: ISSUANCE_API_BASE,
    issuerDid: did,
    apiKeyHash,
    projectId,
    email,
    schema,
  };
});

