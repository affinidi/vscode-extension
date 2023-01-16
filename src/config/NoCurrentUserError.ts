import { configMessage } from "./messages";

export class NoCurrentUserError extends Error {
  message: string = configMessage.noCurrentUser
}
