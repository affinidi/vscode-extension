import { ProgressLocation, window, l10n } from "vscode";
import { validateEmail, validateOTP } from "./validators";
import { userManagementClient } from "./user-management.client";

type AuthProcessOutput = {
  id: string;
  email: string;
  accessToken: string;
};

export function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

type ExecuteAuthProcessProps = {
  isSignUp: boolean;
};

export const executeAuthProcess = async ({
  isSignUp,
}: ExecuteAuthProcessProps): Promise<AuthProcessOutput> => {
  const email = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "email@domain.com",
    prompt: isSignUp
      ? l10n.t("Enter email")
      : l10n.t("Enter the email of your Affinidi account"),
    validateInput: validateEmail,
  });

  if (!email) {
    throw new Error(l10n.t("Email is required"));
  }

  const { token } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: l10n.t("Sending confirmation code"),
    },
    async () => {
      return isSignUp
        ? await userManagementClient.signup({ username: email })
        : await userManagementClient.login({ username: email });
    }
  );

  window.showInformationMessage(
    `${l10n.t("Confirmation code sent to")} ${email}`
  );

  const confirmationCode = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: l10n.t("Confirmation Code"),
    prompt: l10n.t("Paste the code sent to your email"),
    validateInput: validateOTP,
  });

  if (!confirmationCode) {
    throw new Error(l10n.t("Confirmation code is required"));
  }

  const { cookie } = await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `${l10n.t("Signing in to")} Affinidi`,
    },
    async () => {
      return isSignUp
        ? await userManagementClient.signupConfirm({
            confirmationCode,
            token,
          })
        : await userManagementClient.loginConfirm({
            confirmationCode,
            token,
          });
    }
  );

  // Get userId from cookie. Slice removes `console_authtoken=` prefix.
  const { userId } = parseJwt(cookie.slice("console_authtoken=".length));

  return { email: email, id: userId, accessToken: cookie };
};
