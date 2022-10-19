import { ProgressLocation, window } from "vscode";
import { validateEmail, validateOTP } from "./validators";
import * as UserManagementClient from "./user-management.client";

type LoginProcessOutput = {
  id: string;
  email: string;
  accessToken: string;
};

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

export const executeLoginProcess = async (): Promise<LoginProcessOutput> => {
  const email = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "email@domain.com",
    prompt: "Enter the email of your Affinidi account",
    validateInput: validateEmail,
  });
  if (!email) {
    throw new Error("Email is required");
  }

  const { token: loginToken } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Sending confirmation code",
    },
    async (progress, token) => {
      return await UserManagementClient.login({ username: email });
    }
  );
  window.showInformationMessage(`Confirmation code sent to ${email}`);

  const confirmationCode = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "Confirmation Code",
    prompt: "Paste the code sent to your email",
    validateInput: validateOTP,
  });
  if (!confirmationCode) {
    throw new Error("Confirmation code is required");
  }

  const { cookie } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Singing in to Affindi",
    },
    async (progress, token) => {
      return await UserManagementClient.loginConfirm({
        confirmationCode,
        token: loginToken,
      });
    }
  );

  // Get userId from cookie. Slice removes `console_authtoken=` prefix from cookie.
  const userId = parseJwt(cookie.slice(18)).userId;

  return { email: email, id: userId, accessToken: cookie };
};
