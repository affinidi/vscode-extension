import { ProgressLocation, window } from "vscode";
import { validateEmail, validateOTP } from "./validators";
import { userManagementClient } from "./user-management.client";

type AuthProcessOutput = {
  id: string;
  email: string;
  accessToken: string;
};

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

type ExecuteAuthProcessProps = {
  isLogin: boolean
};

export const executeAuthProcess = async ({ isLogin }: ExecuteAuthProcessProps): Promise<AuthProcessOutput> => {
  const email = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "email@domain.com",
    prompt: isLogin ? "Enter the email of your Affinidi account" : "Enter email",
    validateInput: validateEmail,
  });

  if (!email) {
    throw new Error("Email is required");
  }

  const { token } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: "Sending confirmation code",
    },
    async () => {
      return isLogin
        ? await userManagementClient.login({ username: email }) 
        : await userManagementClient.signup({ username: email });
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
    async () => {
      return isLogin  
        ? await userManagementClient.loginConfirm({
            confirmationCode,
            token,
          })
        : await userManagementClient.signupConfirm({
            confirmationCode,
            token,
          });
    }
  );

  // Get userId from cookie. Slice removes `console_authtoken=` prefix from cookie.
  const userId = parseJwt(cookie.slice(18)).userId;

  return { email: email, id: userId, accessToken: cookie };
};
