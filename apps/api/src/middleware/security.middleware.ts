import type { Middleware } from "@oak/oak/middleware";

export const securityMiddleware: Middleware = async (context, next) => {
  try {
    await next();
  } finally {
    const headers = context.response.headers;

    headers.set(
      "x-content-type-options",
      "nosniff",
    );

    headers.set(
      "x-frame-options",
      "DENY",
    );

    headers.set(
      "referrer-policy",
      "strict-origin-when-cross-origin",
    );

    headers.set(
      "permissions-policy",
      "camera=(), microphone=(), geolocation=()",
    );
  }
};
