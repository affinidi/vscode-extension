import { window } from "vscode";
import * as execa from "execa";
import { ext } from "../extensionVariables";

export const WARNING_MESSAGE =
  "Affinidi CLI needs to be installed for some actions in the extension: npm i -g @affinidi/cli";
export const ERROR_MESSAGE =
  "Affinidi CLI needs to be installed to proceed with this action: npm i -g @affinidi/cli";

interface ExecInterface {
  command: (command: string) => Promise<{ stdout: string }>
}

export class CliHelper {
  constructor(private readonly exec: ExecInterface) {}

  async isCliInstalled(): Promise<boolean> {
    const { stdout } = await this.exec.command("npm list -g");
    return stdout.includes("@affinidi/cli");
  }
  
  async assertCliIsInstalled(): Promise<void> {
    if (!(await this.isCliInstalled())) {
      throw new Error(ERROR_MESSAGE);
    }
  }
  
  async isCliInstalledOrWarn(options?: {
    type: "warning" | "error";
  }): Promise<boolean> {
    const isInstalled = await this.isCliInstalled();
  
    if (!isInstalled) {
      if (options?.type === "warning") {
        window.showWarningMessage(WARNING_MESSAGE);
        ext.outputChannel.appendLine(WARNING_MESSAGE);
      } else {
        window.showErrorMessage(ERROR_MESSAGE);
        ext.outputChannel.appendLine(ERROR_MESSAGE);
      }
    }
  
    return isInstalled;
  }
}

export const cliHelper = new CliHelper(execa);
