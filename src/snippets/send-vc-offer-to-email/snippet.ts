import { window, SnippetString } from "vscode";
import { iamService, Project } from "../../services/iamService";
import { ISSUANCE_API_BASE } from "../../services/issuancesService";
import {
  getPublicSchemas,
  SchemaEntity,
} from "../../services/schemaManagerService";
import { Schema } from "../../shared/types";
import { showQuickPick } from "../../utils/showQuickPick";
import * as javascript from "./javascript";
import * as typescript from "./typescript";

export interface SendVcOfferToEmailOptions {
  issuanceApiUrl: string;
  apiKeyHash: string;
  projectId: string;
  issuerDid: string;
  email?: string;
  schema?: Schema;
}

export enum SnippetImplementation {
  sdk,
  fetch,
  axios,
}

const SUPPORTED_LANGUAGE_IDS = [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
] as const;
type SupportedLanguageId = typeof SUPPORTED_LANGUAGE_IDS[number];

const { getProjectSummary, getProjects } = iamService;

export async function insertSendVcOfferToEmailSnippet(values?: {
  implementation?: SnippetImplementation;
  projectId?: string;
  schema?: Schema;
}): Promise<void> {
  try {
    const editor = window.activeTextEditor;
    if (!editor) {
      throw new Error("Open a file to insert a snippet");
    }

    const { languageId } = editor.document;
    if (!isSupportedLanguageId(languageId)) {
      throw new Error(
        "Only JavaScript and TypeScript files are supported for this snippet"
      );
    }

    const projectId = values?.projectId ?? (await askForProjectId());
    const implementation =
      values?.implementation ?? (await askForImplementation());
    const schema = values?.schema ?? (await askForSchema());
    const email = await window.showInputBox({
      prompt: "Enter an email to send the VC offer to",
    });

    const {
      apiKey: { apiKeyHash },
      wallet: { did },
    } = await getProjectSummary(projectId);

    editor.insertSnippet(
      generateSnippet(
        { languageId, implementation },
        {
          issuanceApiUrl: ISSUANCE_API_BASE,
          apiKeyHash,
          issuerDid: did,
          projectId,
          email,
          ...(schema && {
            schema: {
              type: schema.type,
              jsonLdContextUrl: schema.jsonLdContextUrl,
              jsonSchemaUrl: schema.jsonSchemaUrl,
            },
          }),
        }
      )
    );
  } catch (error: any) {
    window.showErrorMessage(error.message);
  }
}

async function askForProjectId(): Promise<string> {
  const { projects } = await getProjects();
  if (projects.length === 0) {
    throw new Error("You need to have a project to generate this snippet");
  }

  let project: Project = projects[0];
  if (projects.length > 1) {
    project =
      (await showQuickPick(
        projects.map((project) => [project.name, project]),
        { title: "Select a project" }
      )) ?? projects[0];
  }

  return project.projectId;
}

async function askForImplementation(): Promise<SnippetImplementation> {
  return (
    (await showQuickPick(
      [
        // TODO: ['Use SDK', Implementation.SDK],
        ["Use Fetch API", SnippetImplementation.fetch],
        ["Use Axios", SnippetImplementation.axios],
      ],
      { title: "Select an implementation" }
    )) ?? SnippetImplementation.fetch
  );
}

async function askForSchema(): Promise<Schema | undefined> {
  const { schemas } = await getPublicSchemas();
  return await showQuickPick([
    "Use an example VC Schema",
    ...schemas.map<[string, SchemaEntity]>((schema) => [schema.id, schema]),
  ]);
}

function generateSnippet(
  context: {
    languageId: SupportedLanguageId;
    implementation: SnippetImplementation;
  },
  options: SendVcOfferToEmailOptions
) {
  if (["javascript", "javascriptreact"].includes(context.languageId)) {
    return new SnippetString(
      context.implementation === SnippetImplementation.fetch
        ? javascript.fetch(options)
        : javascript.axios(options)
    );
  }

  if (["typescript", "typescriptreact"].includes(context.languageId)) {
    return new SnippetString(
      context.implementation === SnippetImplementation.fetch
        ? typescript.fetch(options)
        : typescript.axios(options)
    );
  }

  throw new Error("Unsupported language");
}

function isSupportedLanguageId(
  languageId: unknown
): languageId is SupportedLanguageId {
  return SUPPORTED_LANGUAGE_IDS.includes(languageId as SupportedLanguageId);
}
