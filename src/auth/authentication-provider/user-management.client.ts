import { authentication } from "vscode";
import { apiFetch } from "../../api-client/api-fetch";
import { cookieFetch } from "../../api-client/cookie-fetch";
import { AUTH_PROVIDER_ID } from "./affinidi-authentication-provider";

const USER_MANAGEMENT_API_BASE =
  "https://console-user-management.dev.affinity-project.org/api";

export type LoginInput = {
  username: string;
};

export type LoginOutput = {
  token: string;
};

export const login = async (input: LoginInput): Promise<LoginOutput> => {
  const token = await apiFetch<string>({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/login`,
    method: "POST",
    requestBody: {
      username: input.username,
    },
  });

  return { token };
};

export type LoginConfirmInput = {
  confirmationCode: string;
  token: string;
};

export type LoginConfirmOutput = {
  cookie: string;
};

export const loginConfirm = async (
  input: LoginConfirmInput
): Promise<LoginConfirmOutput> => {
  const cookie = await cookieFetch({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/login/confirm`,
    requestBody: {
      confirmationCode: input.confirmationCode,
      token: input.token,
    },
  });

  return { cookie };
};

export type UserDetailsOutput = {
  userId: string;
  username: string;
};

export const getUserDetails = async (): Promise<UserDetailsOutput> => {
  const session = await authentication.getSession(AUTH_PROVIDER_ID, [], {
    createIfNone: true,
  });
  const { userId, username } = await apiFetch<UserDetailsOutput>({
    endpoint: `${USER_MANAGEMENT_API_BASE}/v1/auth/me`,
    method: "GET",
    headers: {
      cookie: session.accessToken,
    },
  });

  return { userId, username };
};
