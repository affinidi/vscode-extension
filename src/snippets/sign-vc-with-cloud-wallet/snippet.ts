import { ProgressLocation, window } from "vscode";
import { iamService, IAM_API_BASE } from "../../services/iamService";
import { getMySchemas } from "../../services/schemaManagerService";
import { Schema } from "../../shared/types";
import { showQuickPick } from "../../utils/showQuickPick";
import { Implementations } from "../shared/createSnippetTools";
import { askForProjectId } from "../shared/askForProjectId";
import * as javascript from "./javascript";
import * as typescript from "./typescript";
import { createSnippetCommand } from "../shared/createSnippetCommand";
import { nanoid } from "nanoid";
import { ext } from "../../extensionVariables";

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

const EXAMPLE_SCHEMA: Schema = {
  type: "MySchema",
  jsonLdContextUrl: "https://schema.affinidi.com/MySchemaV1-0.jsonld",
  jsonSchemaUrl: "https://schema.affinidi.com/MySchemaV1-0.json",
};

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
      title: "Fetching project information...",
    },
    () => iamService.getProjectSummary(projectId)
  );

  const schema = input?.schema ?? (await askForMySchema(did));
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
    schema
  };
});


async function askForMySchema(did: string): Promise<Schema | undefined> {
  const { schemas } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Fetching available schemas...",
    },
    () => getMySchemas({ did })
  );

  return showQuickPick(
    [
      ["Use an example schema", EXAMPLE_SCHEMA],
      ...schemas.map<[string, Schema]>((schema) => [schema.id, schema]),
    ],
    { title: "Select a VC Schema" }
  );
}