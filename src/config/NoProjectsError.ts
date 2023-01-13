import { configMessage } from "./messages";

export class NoProjectsError extends Error {
  message: string = configMessage.noProjects
}
