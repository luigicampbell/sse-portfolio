import type { Middleware } from "@oak/oak/middleware";

const WEB_DIST_ROOT = new URL(
  "../../../web/dist/",
  import.meta.url,
).pathname;

const IMMUTABLE_ASSET_PREFIX = "/assets/";

const IMMUTABLE_ASSET_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export function createStaticMiddleware(
  root: string,
): Middleware {
  return async (
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

    const pathname = context.request.url.pathname;

    const immutable = isImmutableAssetPath(pathname);

    try {
      await context.send({
        root,
        index: "index.html",
        immutable,
        maxage: immutable ? IMMUTABLE_ASSET_MAX_AGE_MS : 0,
      });

      return;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }
    }

    if (
      !isSpaNavigationRequest(
        pathname,
        context.request.headers.get(
          "accept",
        ),
      )
    ) {
      await next();

      return;
    }

    try {
      await context.send({
        root,
        path: "index.html",
        maxage: 0,
      });
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      await next();
    }
  };
}

export const staticMiddleware = createStaticMiddleware(
  WEB_DIST_ROOT,
);

function isImmutableAssetPath(
  pathname: string,
): boolean {
  return pathname.startsWith(
    IMMUTABLE_ASSET_PREFIX,
  );
}

function isSpaNavigationRequest(
  pathname: string,
  accept: string | null,
): boolean {
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/internal/")
  ) {
    return false;
  }

  if (
    /\/[^/]*\.[^/]+$/.test(
      pathname,
    )
  ) {
    return false;
  }

  return accept?.includes(
    "text/html",
  ) ?? false;
}

function isNotFoundError(
  error: unknown,
): boolean {
  if (
    error instanceof
      Deno.errors.NotFound
  ) {
    return true;
  }

  if (
    typeof error !== "object" ||
    error === null ||
    !("status" in error)
  ) {
    return false;
  }

  return error.status === 404;
}
