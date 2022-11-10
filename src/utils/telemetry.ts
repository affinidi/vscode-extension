import { window, workspace } from "vscode";
import {
  sendEventToAnalytics,
  EventNames,
} from "../services/analyticsStreamApiService";

enum Consent {
  "Accept",
  "Deny",
}

export async function askUserForTelemetryConsent() {
  if (isTelemetryEnabled() === null) {
    const consent = await window.showWarningMessage(
      "By clicking here, I state that I have read and understood the terms and conditions",
      Consent[Consent.Accept],
      Consent[Consent.Deny]
    );

    switch (consent) {
      case Consent[Consent.Accept]:
        await workspace
          .getConfiguration()
          .update("affinidi.telemetry.enabled", true, true);

        sendEventToAnalytics({
          name: EventNames.extensionInitialized,
          subCategory: "affinidiExtension",
        });
        break;
      case Consent[Consent.Deny]:
        await workspace
          .getConfiguration()
          .update("affinidi.telemetry.enabled", false, true);
        break;
    }
  }
}

export function isTelemetryEnabled() {
  return workspace.getConfiguration().get("affinidi.telemetry.enabled");
}
