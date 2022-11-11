import { authentication, commands, window, l10n } from "vscode";
import { ext } from "../extensionVariables";
import {
  sendEventToAnalytics,
  EventNames,
} from "../services/analyticsStreamApiService";
import { cliHelper } from "../utils/cliHelper";

import {
  AffinidiAuthenticationProvider,
  AUTH_PROVIDER_ID,
} from "./authentication-provider/affinidi-authentication-provider";
import { userManagementClient } from "./authentication-provider/user-management.client";

const CONSENT = {
  accept: l10n.t("Accept"),
  reject: l10n.t("Reject"),
};

async function signUpHandler(): Promise<void> {
  const selection = await window.showWarningMessage(
    l10n.t(
      "Please read and accept the [Terms of Use](https://console.affinidi.com/assets/legal/platform-tou.pdf) and [Privacy Policy](https://console.affinidi.com/assets/legal/privacy-policy.pdf)"
    ),
    CONSENT.accept,
    CONSENT.reject
  );

  switch (selection) {
    case CONSENT.accept:
      window.showInformationMessage(
        l10n.t("You accepted terms and conditions")
      );

      await authentication.getSession(AUTH_PROVIDER_ID, ["signup"], {
        forceNewSession: true,
      });

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "signup",
        metadata: {
          commandId: "affinidi.signUp",
        },
      });

      window.showInformationMessage(l10n.t("Signed In to Affinidi"));
      ext.outputChannel.appendLine(l10n.t("Signed In to Affinidi"));
      await cliHelper.isCliInstalledOrWarn({ type: "warning" });
      break;

    case CONSENT.reject:
      window.showInformationMessage(
        l10n.t("You rejected terms and conditions")
      );
      break;
  }
}

async function loginHandler(): Promise<void> {
  await authentication.getSession(AUTH_PROVIDER_ID, ["login"], {
    forceNewSession: true,
  });

  sendEventToAnalytics({
    name: EventNames.commandExecuted,
    subCategory: "login",
    metadata: {
      commandId: "affinidi.login",
    },
  });

  window.showInformationMessage(l10n.t("Signed In to Affinidi"));
  ext.outputChannel.appendLine(l10n.t("Signed In to Affinidi"));
  await cliHelper.isCliInstalledOrWarn({ type: "warning" });
}

async function logoutHandler(): Promise<void> {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: false,
  });

  if (session) {
    sendEventToAnalytics({
      name: EventNames.commandExecuted,
      subCategory: "logout",
      metadata: {
        commandId: "affinidi.logout",
      },
    });

    await ext.authProvider.handleRemoveSession(session.id);

    await window.showInformationMessage(l10n.t("Signed Out of Affinidi"));
    ext.outputChannel.appendLine(l10n.t("Signed Out of Affinidi"));
  } else {
    await window.showInformationMessage(l10n.t("Not logged in to Affinidi"));
  }
}

async function userDetailsHandler(): Promise<void> {
  const userDetails = await userManagementClient.getUserDetails();
  ext.outputChannel.appendLine(JSON.stringify(userDetails));

  sendEventToAnalytics({
    name: EventNames.commandExecuted,
    subCategory: "userDetails",
    metadata: {
      commandId: "affinidi.me",
    },
  });
}

export const initAuthentication = () => {
  ext.context.subscriptions.push(
    commands.registerCommand("affinidi.signUp", signUpHandler)
  );

  ext.context.subscriptions.push(
    commands.registerCommand("affinidi.login", loginHandler)
  );

  ext.context.subscriptions.push(
    commands.registerCommand("affinidi.logout", logoutHandler)
  );

  ext.context.subscriptions.push(
    commands.registerCommand("affinidi.me", userDetailsHandler)
  );

  let authProvider = new AffinidiAuthenticationProvider();
  ext.context.subscriptions.push(authProvider);

  return authProvider;
};
