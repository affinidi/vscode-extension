import { ProgressLocation, window } from "vscode";
import { iamService } from "../../services/iamService";
import { ISSUANCE_API_BASE } from "../../services/issuancesService";
import { getMySchemas } from "../../services/schemaManagerService";
import { Schema } from "../../shared/types";
import { showQuickPick } from "../../utils/showQuickPick";
import { Implementations } from "../shared/createSnippetTools";
import { askForProjectId } from "../shared/askForProjectId";
import * as javascript from "./javascript";
import * as typescript from "./typescript";
import { createSnippetCommand } from "../shared/createSnippetCommand";

export interface SnippetInput {
  issuanceApiUrl: string;
  apiKeyHash: string;
  projectId: string;
  issuerDid: string;
  schema: Schema;
  email?: string;
}

interface CommandInput {
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

const EXAMPLE_SCHEMA: Schema = {
  type: "MySchema",
  jsonLdContextUrl: "https://schema.affinidi.com/MySchemaV1-0.jsonld",
  jsonSchemaUrl: "https://schema.affinidi.com/MySchemaV1-0.json",
};

export const insertSendVcOfferToEmailSnippet = createSnippetCommand<
  SnippetInput,
  CommandInput
>(implementations, async (input) => {
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
