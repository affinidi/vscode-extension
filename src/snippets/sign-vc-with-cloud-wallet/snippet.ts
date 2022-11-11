import { ProgressLocation, window, l10n } from "vscode";
import { iamService, IAM_API_BASE } from "../../services/iamService";
import { Schema } from "../../shared/types";
import { Implementations } from "../shared/createSnippetTools";
import { askForProjectId } from "../shared/askForProjectId";
import * as javascript from "./javascript";
import * as typescript from "./typescript";
import { createSnippetCommand } from "../shared/createSnippetCommand";
import { nanoid } from "nanoid";
import { ext } from "../../extensionVariables";
import { askForMySchema } from "../shared/askForMySchema";

export interface SnippetInput {
  iamUrl: string;
  cloudWalletApiUrl: string;
  apiKeyHash: string;
  issuerDid: string;
  claimId: string;
  schema: Schema;
}

interface CommandInput {
  projectId?: string;
  schema?: Schema;
}

export const implementations: Implementations<SnippetInput> = {
  javascript,
  javascriptreact: javascript,
  typescript,
  typescriptreact: typescript,
};

const CLOUD_WALLET_API_BASE =
  "https://cloud-wallet-api.prod.affinity-project.org/api";

export const insertSignVcWithCloudWalletSnippet = createSnippetCommand<
  SnippetInput,
  CommandInput
>("signVcWithCloudWallet", "vc", implementations, async (input) => {
  const session = await ext.authProvider.requireActiveSession({
    createIfNone: true,
  });

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
      title: l10n.t("Fetching project information..."),
    },
    () => iamService.getProjectSummary(projectId)
  );

  const schema = input?.schema ?? (await askForMySchema({ did, apiKeyHash }));
  if (!schema) {
    return;
  }

  return {
    iamUrl: IAM_API_BASE,
    cloudWalletApiUrl: CLOUD_WALLET_API_BASE,
    issuerDid: did,
    apiKeyHash,
    projectId,
    cookie: session.accessToken,
    claimId: nanoid(),
    schema,
  };
});
