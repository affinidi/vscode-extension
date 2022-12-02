import { TextEditor, window, workspace } from 'vscode'
import { Implementations, SnippetImplementation } from '../../../snippets/shared/createSnippetTools'

type TestHandler = (input: {
  editor: TextEditor
  implementation: SnippetImplementation
}) => Promise<void>

/**
 * Run test for each snippet implementation and supported language
 * @param implementations Snippet implementations map
 * @param test A test handler that should be called for each implementation and supported language
 */
export function testSnippet(implementations: Implementations<never>, test: TestHandler) {
  for (const languageId of Object.keys(implementations)) {
    for (const implementation of Object.keys(implementations[languageId])) {
      it(`should insert a snippet for "${languageId}" using "${implementation}"`, async () => {
        // create editor for supported language
        const editor = await window.showTextDocument(
          await workspace.openTextDocument({
            language: languageId,
          }),
        )

        // call test handler for the implementation
        await test({
          editor,
          implementation: implementation as SnippetImplementation,
        })
      })
    }
  }
}
