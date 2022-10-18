import * as vscode from "vscode";
import { ext } from "../../extensionVariables";
import { AffinidiOTPAuthenticationProvider } from "../authProvider";

export async function logoutHandler(): Promise<void> {
  const session = await vscode.authentication.getSession(
    AffinidiOTPAuthenticationProvider.id,
    [],
    { createIfNone: false }
  );
  if (session) {
    console.log(session.id);
    await ext.authProvider.removeSession(session.id);
    await vscode.window.showInformationMessage("Signed Out of Affinidi");
    ext.outputChannel.appendLine("Signed Out of Affinidi");
  } else {
    await vscode.window.showInformationMessage("Not logged in to Affinidi");
  }
}
