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
    const consent = await window.showInformationMessage(
      l10n.t(
        "Help us make Affinidi better! Do you accept to send anonymous usage data?"
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
