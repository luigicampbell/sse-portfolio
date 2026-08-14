import type { Middleware } from "@oak/oak/middleware";

const WEB_DIST_ROOT = `${Deno.cwd()}/apps/web/dist`;

export const staticMiddleware: Middleware = async (
  context,
  next,
) => {
  if (
    context.request.method !== "GET" &&
    context.request.method !== "HEAD"
  ) {
    await next();
    return;
  }

  try {
    await context.send({
      root: WEB_DIST_ROOT,
    });

    return;
  } catch (error) {
    if (
      !(error instanceof
        Deno.errors.NotFound)
    ) {
      throw error;
    }
  }

  try {
    await context.send({
      root: WEB_DIST_ROOT,
      path: "index.html",
    });

    return;
  } catch (error) {
    if (
      !(error instanceof
        Deno.errors.NotFound)
    ) {
      throw error;
    }
  }

  await next();
};
