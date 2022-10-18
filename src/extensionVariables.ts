import * as vscode from "vscode";
import { AffinidiOTPAuthenticationProvider } from "./auth/authProvider";

export namespace ext {
  export let context: vscode.ExtensionContext;
  export let outputChannel: vscode.OutputChannel;
  export let authProvider: AffinidiOTPAuthenticationProvider;
}
