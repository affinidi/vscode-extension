import { window, workspace } from "vscode";

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
