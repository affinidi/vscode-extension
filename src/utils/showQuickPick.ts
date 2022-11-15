import { QuickPickOptions, window } from 'vscode'

export async function showQuickPick<T>(
  entries: (string | [string, T])[],
  options?: QuickPickOptions,
): Promise<T | undefined> {
  const selectedLabel = await window.showQuickPick(
    entries.map((entry) => (Array.isArray(entry) ? entry[0] : entry)),
    options,
  )
  if (selectedLabel === undefined) {
    return undefined
  }

  const entry = entries.find((entry) => entry[0] === selectedLabel)
  if (!Array.isArray(entry)) {
    return undefined
  }

  return entry[1]
}
