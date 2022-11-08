import * as path from "path";
import { ProgressLocation, window, Uri } from "vscode";
import { cliHelper } from "../../utils/cliHelper";

export const NO_DIRECTORY_SELECTED_MESSAGE = "Installation folder didn't select.";
export const NO_APP_NAME_SELECTED_MESSAGE = "App name didn't specify.";

export async function generateAffinidiAppWithCLI(): Promise<void> {
  const isCLIInstalled = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Checking CLI installation...",
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
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
  });

  if (!selectedFolder) {
    window.showErrorMessage(NO_DIRECTORY_SELECTED_MESSAGE);
    return;
  }

  const { path: folderPath } = Uri.parse(selectedFolder.toString());

  const appName = await window.showInputBox({
    prompt: "Enter an app name",
  });

  if (!appName) {
    window.showErrorMessage(NO_APP_NAME_SELECTED_MESSAGE);
    return;
  }

  const fullPath = path.join(folderPath, appName);

  await cliHelper.generateApp({ path: fullPath });
}
