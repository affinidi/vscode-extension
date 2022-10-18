import fetch from "node-fetch";
import * as vscode from "vscode";
import { ext } from "../extensionVariables";
import { AffinidiOTPAuthenticationProvider } from "./authProvider";

export async function login(email: string): Promise<string> {
  try {
    const body = { username: email };
    const req = await fetch(
      "https://console-user-management.apse1.affinidi.com/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
        },
      }
    );

    if (!req.ok) {
      throw new Error(req.statusText);
    }
    const tokenChallenge = await req.json();

    vscode.window.showInformationMessage(`Confirmation code sent to ${email}`);
    return tokenChallenge;
  } catch (e: any) {
    ext.outputChannel.appendLine("Unexpected error sending confirmation code");
    ext.outputChannel.appendLine(e);
    vscode.window.showErrorMessage("Unexpected error sending confirmation code");
    throw e;
  }
}

export async function loginConfirm(
  confirmationCode: string,
  tokenChallenge: string
): Promise<string> {
  try {
    const body = { confirmationCode: confirmationCode, token: tokenChallenge };
    const req = await fetch(
      "https://console-user-management.apse1.affinidi.com/api/v1/auth/login/confirm",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
        },
      }
    );

    if (!req.ok) {
      throw new Error(req.statusText);
    }
    const cookie = await req.headers.get("set-cookie");
    if (!cookie) {
      throw new Error("No Cookie received");
    }

    return cookie;
  } catch (e: any) {
    ext.outputChannel.appendLine("Unexpected error confirming OTP");
    ext.outputChannel.appendLine(e);
    vscode.window.showErrorMessage("Unexpected error confirming OTP");
    throw e;
  }
}

export async function getUserDetails(): Promise<any> {
  try {
    const session = await vscode.authentication.getSession(
      AffinidiOTPAuthenticationProvider.id,
      [],
      { createIfNone: true }
    );
    const req = await fetch(
      "https://console-user-management.apse1.affinidi.com/api/v1/auth/me",
      {
        headers: {
          "content-type": "application/json",
          cookie: session.accessToken,
        },
      }
    );

    if (!req.ok) {
      throw new Error(req.statusText);
    }
    const userDetails = await req.json();
    return userDetails;
  } catch (e: any) {
    ext.outputChannel.appendLine(e);
    vscode.window.showErrorMessage("Unexpected error getting user details");
    throw e;
  }
}
