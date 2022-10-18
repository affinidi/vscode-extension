import { ext } from "../../extensionVariables";
import { getUserDetails } from "../authService";

export async function userDetailsHandler(): Promise<void> {
  const userDetails = await getUserDetails();
  ext.outputChannel.appendLine(JSON.stringify(userDetails));
}
