import nodeFetch from "node-fetch";
import { ApiOperationError } from "./api-operation.error";

const CONTENT_TYPE_HEADER = "Content-Type";

export const cookieFetch = async ({
  endpoint,
  requestBody,
}: {
  endpoint: string;
  requestBody: unknown;
}): Promise<string> => {
  const response = await nodeFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
      [CONTENT_TYPE_HEADER]: "application/json",
    },
  });
  const { status: statusCode } = response;

  const cookie = await response.headers.get("set-cookie");

  if (!String(statusCode).startsWith("2")) {
    const error = await response.json();
    const { code, message, context, httpStatusCode } = error;

    throw new ApiOperationError(
      {
        code,
        message,
        httpStatusCode: httpStatusCode || statusCode,
      },
      context,
      error
    );
  } else if (!cookie) {
    throw new ApiOperationError(
      {
        message: "No Cookie",
        httpStatusCode: statusCode,
      },
      context
    );
  }

  return cookie;
};
