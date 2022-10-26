import { window } from "vscode";
import { createProject } from "../services/iamService";

export const createProjectProcess = async (): Promise<void> => {
  const projectName = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "Project Name",
    prompt: "Enter the project name",
  });

  if (!projectName) {
    window.showErrorMessage("Project name is required");
    return;
  }
  
  try {
    await createProject(projectName);
    window.showInformationMessage("Successfully created the project");
  } catch (err: any) {
    window.showErrorMessage(
      `Project could not be created, please try again later. ${err.message}`
    );
  }
};
