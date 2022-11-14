import * as path from "path";
import { ProgressLocation, window, Uri, l10n } from "vscode";
import { cliHelper } from "../../utils/cliHelper";

export const NO_DIRECTORY_SELECTED_MESSAGE = l10n.t(
  "Installation folder wasn't selected."
);
export const NO_APP_NAME_SELECTED_MESSAGE = l10n.t(
  "App name wasn't specified."
);

export async function generateAffinidiAppWithCLI(): Promise<void> {
  const isCLIInstalled = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t("Checking CLI installation..."),
    },
    async () => {
      return await cliHelper.isCliInstalledOrWarn({ type: "error" });
    }
  );

  if (!isCLIInstalled) {
    return;
  }

  const selectedFolder = await window.showOpenDialog({
    canSelectMany: false,
    openLabel: l10n.t("Select"),
    canSelectFiles: false,
    canSelectFolders: true,
  });

  if (!selectedFolder || selectedFolder && !selectedFolder.length) {
    window.showErrorMessage(NO_DIRECTORY_SELECTED_MESSAGE);
    return;
  }

  const { fsPath: folderPath } = Uri.parse(selectedFolder[0].toString());

  const appName = await window.showInputBox({
    prompt: l10n.t("Enter an app name"),
  });

  if (!appName) {
    window.showErrorMessage(NO_APP_NAME_SELECTED_MESSAGE);
    return;
  }

  const fullPath = path.join(folderPath, appName);

  await cliHelper.generateApp({ path: fullPath });
}
