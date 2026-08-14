import { Application } from "@oak/oak";

import { env } from "./config/env.ts";

import { errorMiddleware } from "./middleware/error.middleware.ts";
import { securityMiddleware } from "./middleware/security.middleware.ts";
import { staticMiddleware } from "./middleware/static.middleware.ts";
import { timingMiddleware } from "./middleware/timing.middleware.ts";

import { createRouter } from "./router.ts";

const app = new Application();

const router = createRouter();

app.use(
  timingMiddleware,
);

app.use(
  securityMiddleware,
);

app.use(
  errorMiddleware,
);

app.use(
  router.routes(),
);

app.use(
  router.allowedMethods(),
);

app.use(
  staticMiddleware,
);

app.use(
  (context) => {
    context.response.status = 404;

    context.response.body = {
      error: "Not found.",
    };
  },
);

console.log(
  `API listening on http://localhost:${env.apiPort}`,
);

await app.listen({
  hostname: "0.0.0.0",
  port: env.apiPort,
});
