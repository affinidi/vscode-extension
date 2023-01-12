import { Position, SnippetString, TextEditor, window, workspace } from 'vscode'
import { showQuickPick } from '../../utils/showQuickPick'
import { createSnippetTools, Implementations, SnippetImplementation } from './createSnippetTools'
import * as javascript from '../boilerplates/javascript'
import * as typescript from '../boilerplates/typescript'
import { notifyError } from '../../utils/notifyError'
import { snippetMessage } from '../messages'
import { telemetryHelpers } from '../../features/telemetry/telemetryHelpers'

export type SnippetCommand<CommandInput = unknown> = (
  input?: CommandInput,
  implementation?: SnippetImplementation,
  editor?: TextEditor,
  position?: Position,
) => Promise<void>

export const languageIdLabels: Record<string, string> = {
  javascript: 'JavaScript',
  javascriptreact: 'JavaScript (React)',
  typescript: 'TypeScript',
  typescriptreact: 'TypeScript (React)',
}

const boilerplates: {
  [languageId: string]: {
    [implementation in SnippetImplementation]?: () => string
  }
} = {
  javascript,
  typescript,
}

const SUPPORTED_BOILERPLATE_LANGUAGE_IDS = Object.keys(boilerplates)

export function createSnippetCommand<SnippetInput, CommandInput>(
  name: string,
  implementations: Implementations<SnippetInput>,
  getSnippetInput: (
    input?: CommandInput,
    implementation?: SnippetImplementation,
  ) => Promise<(SnippetInput & { projectId?: string }) | undefined>,
): SnippetCommand<CommandInput> {
  const supportedLanguageIds = Object.keys(implementations)
  const { askForImplementation, isLanguageSupported, generateSnippet } =
    createSnippetTools<SnippetInput>(implementations)

  return async (
    commandInput,
    defaultImplementation,
    defaultEditor = window.activeTextEditor,
    position,
  ) => {
    try {
      let editor: TextEditor | undefined = defaultEditor
      let languageId: string
      if (editor && isLanguageSupported(editor.document.languageId)) {
        languageId = editor.document.languageId
      } else {
        editor = undefined

        const languageIds = SUPPORTED_BOILERPLATE_LANGUAGE_IDS.filter((id) =>
          supportedLanguageIds.includes(id),
        )

        const selectedLanguageId = await showQuickPick(
          languageIds.map((id) => [languageIdLabels[id], id]),
          { title: snippetMessage.selectLanguage },
        )

        if (!selectedLanguageId) {
          return
        }

        languageId = selectedLanguageId
      }

      const implementation = defaultImplementation ?? (await askForImplementation(languageId))
      if (!implementation) {
        return
      }

      if (!implementations[languageId]?.[implementation]) {
        throw new Error(
          `${snippetMessage.snippetDoesNotSupportImplementationForLangauge} ${[
            implementation,
            languageId,
          ]}`,
        )
      }

      const snippetInput = await getSnippetInput(commandInput, implementation)
      if (!snippetInput) {
        // interrupted (for example, by pressing "Escape")
        return
      }

      let wasBoilerplateGenerated = false
      if (!editor || editor.document.getText().trim().length === 0) {
        if (!editor) {
          editor = await window.showTextDocument(
            await workspace.openTextDocument({
              language: languageId,
            }),
          )
        }

        const generateBoilerplate = boilerplates[languageId]?.[implementation]
        if (generateBoilerplate) {
          await editor.insertSnippet(new SnippetString(generateBoilerplate()))
          wasBoilerplateGenerated = true
        }
      }

      await editor.insertSnippet(
        generateSnippet(languageId, implementation, snippetInput),
        wasBoilerplateGenerated ? undefined : position,
      )

      telemetryHelpers.trackSnippetInserted({
        snippetName: name,
        language: languageId,
        implementation,
        projectId: snippetInput.projectId,
      })
    } catch (error: unknown) {
      notifyError(error, snippetMessage.snippetGenerationFailed)
    }
  }
}
