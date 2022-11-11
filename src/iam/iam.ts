import { window, l10n } from "vscode";
import { iamService } from "../services/iamService";

export const createProjectProcess = async (): Promise<void> => {
  const projectName = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: l10n.t("Project Name"),
    prompt: l10n.t("Enter the project name"),
  });

  if (!projectName) {
    window.showErrorMessage(l10n.t("Project name is required"));
    return;
  }

  try {
    await iamService.createProject(projectName);
    window.showInformationMessage(l10n.t("Successfully created the project"));
  } catch (err: any) {
    window.showErrorMessage(
      `${l10n.t("Project could not be created, please try again later.")} ${err.message}`
    );
  }
};
