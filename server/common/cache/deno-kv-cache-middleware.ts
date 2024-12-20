import { RouteParams, RouterContext, State } from "@oak/oak";
import { DenoKvCache } from "./deno-kv-cache.ts";
import { RequestHasher } from "../request-hasher.ts";

export function createDenoKvCacheMiddleware<
  R extends string,
  P extends RouteParams<R> = RouteParams<R>,
  S extends State = Record<string, unknown>,
>(cache: DenoKvCache, cacheEnabled: boolean) {
  if (!cacheEnabled) {
    return async (
      _ctx: RouterContext<R, P, S>,
      next: () => Promise<unknown>,
    ) => {
      await next();
    };
  }

  return async (ctx: RouterContext<R, P, S>, next: () => Promise<unknown>) => {
    const cacheKey = await RequestHasher.hashRequest(ctx);

    // Try to get from cache
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      ctx.response.body = cachedResponse;
      return;
    }

    // Process request and cache if success response
    await next();
    console.debug(ctx.response.body);

    if (ctx.response.status === 200) {
      await cache.set(cacheKey, ctx.response.body);
    }
  };
}
