import { SnippetString } from "vscode";
import { showQuickPick } from "../../utils/showQuickPick";
import { languageIdLabels } from "./createSnippetCommand";

export enum SnippetImplementation {
  sdk = "sdk",
  fetch = "fetch",
  axios = "axios",
}

export type Implementations<Input> = {
  [language: string]: {
    [implementation in SnippetImplementation]?: (input: Input) => string;
  };
};

const implementationLabels = {
  [SnippetImplementation.sdk]: "Use Affinidi SDK",
  [SnippetImplementation.fetch]: "Use Fetch API",
  [SnippetImplementation.axios]: "Use Axios",
};

export function createSnippetTools<
  Input,
  T extends Implementations<Input> = Implementations<Input>
>(implementations: T) {
  return {
    isLanguageSupported(languageId: string): boolean {
      return languageId in implementations;
    },

    async askForImplementation(languageId: keyof T): Promise<SnippetImplementation | undefined> {
      const supported = Object.keys(
        implementations[languageId]
      ) as (keyof typeof SnippetImplementation)[];

      const selectedValue =
        (await showQuickPick(
          supported.map((implementation) => [
            implementationLabels[implementation],
            implementation,
          ]),
          { title: "Select an implementation" }
        ));

      if (!selectedValue) {
        return;
      }

      return SnippetImplementation[selectedValue];
    },

    generateSnippet(
      languageId: string,
      implementation: SnippetImplementation,
      input: Input
    ): SnippetString {
      const generate = implementations[languageId]?.[implementation];
      if (!generate) {
        throw new Error(
          "Could not generate a snippet: unsupported language or implementation"
        );
      }

      return new SnippetString(generate(input));
    },
  };
}
