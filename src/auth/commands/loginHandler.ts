import * as vscode from "vscode";
import { ext } from "../../extensionVariables";
import { AffinidiOTPAuthenticationProvider } from "../authProvider";

export async function loginHandler(): Promise<void> {
  const session = await vscode.authentication.getSession(
    AffinidiOTPAuthenticationProvider.id,
    [],
    { createIfNone: true }
  );
  await vscode.window.showInformationMessage("Signed In to Affinidi");
  ext.outputChannel.appendLine("Signed In to Affinidi");
}
