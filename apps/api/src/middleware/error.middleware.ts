import type { Middleware } from "@oak/oak/middleware";

export const errorMiddleware: Middleware = async (context, next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);

    context.response.status = 500;
    context.response.type = "application/json";
    context.response.body = {
      error: "Internal server error.",
    };
  }
};
