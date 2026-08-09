import type { Middleware } from "@oak/oak/middleware";

export const timingMiddleware: Middleware = async (context, next) => {
  const start = performance.now();

  try {
    await next();
  } finally {
    const duration = performance.now() - start;

    context.response.headers.set(
      "server-timing",
      `app;dur=${duration.toFixed(2)}`,
    );
  }
};
