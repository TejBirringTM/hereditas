import { Application } from "@oak/oak";
import config from "./config.ts";
import services from "./services.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

console.dir(config, { depth: Infinity });

const app = new Application();

app.use(oakCors({
  origin: config.cors.origin,
}));

services.forEach((service) => {
  app.use(service.router.routes());
  app.use(service.router.allowedMethods());
});

app.addEventListener("listen", (ev) => {
  console.log(`Listening on http://${config.host}:${ev.port}`);
});

app.listen({
  port: config.port,
  hostname: config.host
});
