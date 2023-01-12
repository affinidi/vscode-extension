import { SnippetString } from 'vscode'
import { snippetMessage } from '../messages'
import { showQuickPick } from '../../utils/showQuickPick'

export enum SnippetImplementation {
  sdk = 'sdk',
  fetch = 'fetch',
}

export type Implementations<Input> = {
  [language: string]: {
    [implementation in SnippetImplementation]?: (input: Input) => string
  }
}

const implementationLabels = {
  [SnippetImplementation.sdk]: snippetMessage.snippetImplementationSdk,
  [SnippetImplementation.fetch]: snippetMessage.snippetImplementationFetch,
}

export function createSnippetTools<
  Input,
  T extends Implementations<Input> = Implementations<Input>,
>(implementations: T) {
  return {
    isLanguageSupported(languageId: string): boolean {
      return languageId in implementations
    },

    async askForImplementation(languageId: keyof T): Promise<SnippetImplementation | undefined> {
      const supported = Object.keys(
        implementations[languageId],
      ) as (keyof typeof SnippetImplementation)[]

      if (supported.length === 0) {
        return undefined
      }

      if (supported.length === 1) {
        return SnippetImplementation[supported[0]]
      }

      const selectedValue = await showQuickPick(
        supported.map((implementation) => [implementationLabels[implementation], implementation]),
        { title: snippetMessage.selectImplementation },
      )

      if (!selectedValue) {
        return undefined
      }

      return SnippetImplementation[selectedValue]
    },

    generateSnippet(
      languageId: string,
      implementation: SnippetImplementation,
      input: Input,
    ): SnippetString {
      const generate = implementations[languageId]?.[implementation]
      if (!generate) {
        throw new Error(snippetMessage.unsupportedSnippetGeneration)
      }

      return new SnippetString(generate(input))
    },
  }
}
