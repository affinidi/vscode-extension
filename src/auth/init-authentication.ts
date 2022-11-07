import { authentication, commands, window } from "vscode";
import { ext } from "../extensionVariables";
import {
  sendEventToAnalytics,
  EventNames,
} from "../services/analyticsStreamApiService";

import {
  AffinidiAuthenticationProvider,
  AUTH_PROVIDER_ID,
} from "./authentication-provider/affinidi-authentication-provider";
import { userManagementClient } from "./authentication-provider/user-management.client";

import { cliHelper }  from '../utils/cliHelper';

enum Consent {
  "Accept",
  "Reject",
}

async function signUpHandler(): Promise<void> {
  const selection = await window.showWarningMessage(
    "Please read and accept the [Terms of Use](https://console.affinidi.com/assets/legal/platform-tou.pdf) and [Privacy Policy](https://console.affinidi.com/assets/legal/privacy-policy.pdf)",
    Consent[Consent.Accept],
    Consent[Consent.Reject]
  );

  switch (selection) {
    case Consent[Consent.Accept]:
      window.showInformationMessage("You accepted terms and conditions");

      await authentication.getSession(AUTH_PROVIDER_ID, ["signup"], {
        forceNewSession: true,
      });

      sendEventToAnalytics({
        name: EventNames.commandExecuted,
        subCategory: "signup",
        metadata: {
          commandId: "affinidi.signup",
        },
      });

      window.showInformationMessage("Signed In to Affinidi");
      ext.outputChannel.appendLine("Signed In to Affinidi");
      await cliHelper.isCliInstalledOrWarn({type: 'warning'});
      break;

    case Consent[Consent.Reject]:
      window.showInformationMessage("You rejected terms and conditions");
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
  window.showInformationMessage("Signed In to Affinidi");
  ext.outputChannel.appendLine("Signed In to Affinidi");
  await cliHelper.isCliInstalledOrWarn({type: 'warning'});
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

    await window.showInformationMessage("Signed Out of Affinidi");
    ext.outputChannel.appendLine("Signed Out of Affinidi");
  } else {
    await window.showInformationMessage("Not logged in to Affinidi");
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
    commands.registerCommand("affinidi.signup", signUpHandler)
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

  let authProvider = new AffinidiAuthenticationProvider(ext.context);
  ext.context.subscriptions.push(authProvider);

  return authProvider;
};
