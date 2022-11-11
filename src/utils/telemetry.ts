import { window, workspace, l10n } from "vscode";
import {
  sendEventToAnalytics,
  EventNames,
} from "../services/analyticsStreamApiService";

const CONSENT = {
  accept: l10n.t("Accept"),
  deny: l10n.t("Deny"),
};

export async function askUserForTelemetryConsent() {
  if (isTelemetryEnabled() === null) {
    const consent = await window.showWarningMessage(
      l10n.t(
        "By clicking here, I state that I have read and understood the terms and conditions"
      ),
      CONSENT.accept,
      CONSENT.deny
    );

    switch (consent) {
      case CONSENT.accept:
        await workspace
          .getConfiguration()
          .update("affinidi.telemetry.enabled", true, true);

        sendEventToAnalytics({
          name: EventNames.extensionInitialized,
          subCategory: "affinidiExtension",
        });
        break;
      case CONSENT.deny:
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
