import { Application } from "@oak/oak";
import config from "./config.ts";
import services from "./the-services-collection.ts";

const app = new Application();

services.forEach((service)=>{
  app.use(service.router.routes());
  app.use(service.router.allowedMethods());
});

app.addEventListener("listen", (ev)=>{
  console.log(`Listening on ${ev.hostname}:${ev.port}`);
});

app.listen({
  port: config.port,
});
