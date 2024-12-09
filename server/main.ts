import { Application } from "@oak/oak";
import config from "./config.ts";
import services from "./services.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();

app.use(oakCors({
  origin: config.cors.origin,
}));

services.forEach((service) => {
  app.use(service.router.routes());
  app.use(service.router.allowedMethods());
});

app.addEventListener("listen", (ev) => {
  console.log(`Listening on ${ev.hostname}:${ev.port}`);
});

app.listen({
  port: config.port,
});
