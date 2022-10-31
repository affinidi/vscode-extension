import { SnippetString, TextEditor, window, workspace } from "vscode";
import { showQuickPick } from "../../utils/showQuickPick";
import {
  createSnippetTools,
  Implementations,
  SnippetImplementation,
} from "./createSnippetTools";
import * as javascript from "../boilerplates/javascript";
import * as typescript from "../boilerplates/typescript";

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
  implementations: Implementations<SnippetInput>,
  getSnippetInput: (
    input?: CommandInput,
    implementation?: SnippetImplementation
  ) => Promise<SnippetInput | undefined>
): (
  input?: CommandInput,
  implementation?: SnippetImplementation,
  editor?: TextEditor
) => Promise<void> {
  const supportedLanguageIds = Object.keys(implementations);
  const { askForImplementation, assertSupportedLanguage, generateSnippet } =
    createSnippetTools<SnippetInput>(implementations);

  return async (
    commandInput,
    implementation,
    editor = window.activeTextEditor
  ) => {
    try {
      let languageId: string;
      if (editor) {
        assertSupportedLanguage(editor.document.languageId);
        languageId = editor.document.languageId;
      } else {
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
      }

      await editor.insertSnippet(
        generateSnippet(languageId, implementation, snippetInput)
      );
    } catch (error: any) {
      console.log(error);
      window.showErrorMessage(error.message);
    }
  };
}
