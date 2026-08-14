import type {
  Middleware,
} from "@oak/oak/middleware";

const WEB_DIST_ROOT =
  new URL(
    "../../../web/dist/",
    import.meta.url,
  ).pathname;

export const staticMiddleware:
  Middleware = async (
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
        index: "index.html",
      });

      return;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }
    }

    if (
      !isSpaNavigationRequest(
        context.request.url.pathname,
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
        root: WEB_DIST_ROOT,
        path: "index.html",
      });
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      await next();
    }
  };

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