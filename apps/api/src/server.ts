import { Application } from "@oak/oak/application";

import { env } from "./config/env.ts";
import { createRouter } from "./router.ts";

const app = new Application();

const router = createRouter();

app.use(router.routes());
app.use(router.allowedMethods());

app.use((context) => {
  context.response.status = 404;
  context.response.type = "application/json";
  context.response.body = {
    error: "Not found.",
  };
});

console.log(
  `API listening on http://localhost:${env.apiPort}`,
);

await app.listen({
  hostname: "0.0.0.0",
  port: env.apiPort,
});
