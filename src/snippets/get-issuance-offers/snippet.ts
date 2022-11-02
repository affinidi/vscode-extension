import { ProgressLocation, window } from "vscode";
import { iamService } from "../../services/iamService";
import {
  getProjectIssuances,
  ISSUANCE_API_BASE,
} from "../../services/issuancesService";
import { showQuickPick } from "../../utils/showQuickPick";
import { askForProjectId } from "../shared/askForProjectId";
import { createSnippetCommand } from "../shared/createSnippetCommand";
import { Implementations } from "../shared/createSnippetTools";
import * as javascript from "./javascript";
import * as typescript from "./typescript";

export interface SnippetInput {
  issuanceApiUrl: string;
  apiKeyHash: string;
  issuanceId?: string;
}

interface CommandInput {
  projectId?: string;
  issuanceId?: string;
}

export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
};

export const insertGetIssuanceOffersSnippet = createSnippetCommand<
  SnippetInput,
  CommandInput
>("getIssuanceOffers", "vcOffer", implementations, async (input) => {
  const projectId = input?.projectId ?? (await askForProjectId());
  if (!projectId) {
    return;
  }

  const {
    apiKey: { apiKeyHash },
  } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Fetching project information...",
    },
    () => iamService.getProjectSummary(projectId)
  );

  const issuanceId =
    input?.issuanceId ?? (await askForIssuanceId({ apiKeyHash, projectId }));
  if (!issuanceId) {
    return;
  }

  return {
    issuanceApiUrl: ISSUANCE_API_BASE,
    apiKeyHash,
    issuanceId,
  };
});

async function askForIssuanceId(input: {
  apiKeyHash: string;
  projectId: string;
}): Promise<string | undefined> {
  const { issuances } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Fetching available issuances...",
    },
    () => getProjectIssuances(input)
  );

  return showQuickPick(
    [
      ...issuances.map<[string, string]>((issuance) => [
        issuance.id,
        issuance.id,
      ]),
    ],
    { title: "Select an Issuance" }
  );
}
