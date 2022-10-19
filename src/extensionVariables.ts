import * as vscode from "vscode";
import { AffinidiAuthenticationProvider } from "./auth/authentication-provider/affinidi-authentication-provider";

export namespace ext {
  export let context: vscode.ExtensionContext;
  export let outputChannel: vscode.OutputChannel;
  export let authProvider: AffinidiAuthenticationProvider;
}
