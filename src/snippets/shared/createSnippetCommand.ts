import {
  CancellationToken,
  Position,
  SnippetString,
  TextEditor,
  window,
  workspace,
} from "vscode";
import { showQuickPick } from "../../utils/showQuickPick";
import {
  createSnippetTools,
  Implementations,
  SnippetImplementation,
} from "./createSnippetTools";
import * as javascript from "../boilerplates/javascript";
import * as typescript from "../boilerplates/typescript";
import {
  EventNames,
  sendEventToAnalytics,
} from "../../services/analyticsStreamApiService";

export type SnippetCommand<CommandInput = unknown> = (
  input?: CommandInput,
  implementation?: SnippetImplementation,
  editor?: TextEditor,
  position?: Position
) => Promise<void>;

export const languageIdLabels: Record<string, string> = {
  javascript: "JavaScript",
  javascriptreact: "JavaScript (React)",
  typescript: "TypeScript",
  typescriptreact: "TypeScript (React)",
};

const boilerplates: {
  [languageId: string]: {
    [implementation in SnippetImplementation]?: () => string;
  };
} = {
  javascript,
  typescript,
};

const SUPPORTED_BOILERPLATE_LANGUAGE_IDS = Object.keys(boilerplates);

export function createSnippetCommand<SnippetInput, CommandInput>(
  name: string,
  snippetCategory: string,
  implementations: Implementations<SnippetInput>,
  getSnippetInput: (
    input?: CommandInput,
    implementation?: SnippetImplementation
  ) => Promise<SnippetInput | undefined>
): SnippetCommand<CommandInput> {
  const supportedLanguageIds = Object.keys(implementations);
  const { askForImplementation, isLanguageSupported, generateSnippet } =
    createSnippetTools<SnippetInput>(implementations);

  return async (
    commandInput,
    implementation,
    editor = window.activeTextEditor,
    position
  ) => {
    try {
      let languageId: string;
      if (editor && isLanguageSupported(editor.document.languageId)) {
        languageId = editor.document.languageId;
      } else {
        editor = undefined;

        const languageIds = SUPPORTED_BOILERPLATE_LANGUAGE_IDS.filter(
          (languageId) => supportedLanguageIds.includes(languageId)
        );

        const selectedLanguageId = await showQuickPick(
          languageIds.map((languageId) => [
            languageIdLabels[languageId],
            languageId,
          ]),
          { title: "Select a language" }
        );

        if (!selectedLanguageId) {
          return;
        }

        languageId = selectedLanguageId;
      }

      implementation =
        implementation ?? (await askForImplementation(languageId));
      if (!implementation) {
        return;
      }

      if (!implementations[languageId]?.[implementation]) {
        throw new Error(
          `Snippet does not support "${implementation}" implementation for "${languageId}" language`
        );
      }

      const snippetInput = await getSnippetInput(commandInput, implementation);
      if (!snippetInput) {
        // interrupted (for example, by pressing "Escape")
        return;
      }

      let wasBoilerplateGenerated = false;
      if (!editor || editor.document.getText().trim().length === 0) {
        if (!editor) {
          editor = await window.showTextDocument(
            await workspace.openTextDocument({
              language: languageId,
            })
          );
        }

        const generateBoilerplate = boilerplates[languageId]?.[implementation];
        if (!generateBoilerplate) {
          throw new Error(
            `Boilerplate is not available for "${languageId}" language and ${implementation} implementation`
          );
        }

        await editor.insertSnippet(new SnippetString(generateBoilerplate()));
        wasBoilerplateGenerated = true;
      }

      await editor.insertSnippet(
        generateSnippet(languageId, implementation, snippetInput),
        wasBoilerplateGenerated ? undefined : position
      );

      sendEventToAnalytics({
        name: EventNames.snippetInserted,
        subCategory: snippetCategory,
        metadata: {
          snippetName: name,
        },
      });
    } catch (error: any) {
      console.log(error);
      window.showErrorMessage(error.message);
    }
  };
}
