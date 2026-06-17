import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

function isHttpControlFlow(error: unknown) {
  if (error instanceof Response) return true;
  if (error == null || typeof error !== "object") return false;

  const fields = error as Record<string, unknown>;
  const status = fields.status ?? fields.statusCode;

  return typeof status === "number" && status >= 300 && status < 600;
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (isHttpControlFlow(error)) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
