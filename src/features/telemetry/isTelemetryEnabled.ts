import { workspace } from 'vscode'

export function isTelemetryEnabled() {
  return workspace.getConfiguration().get('affinidi.telemetry.enabled')
}
