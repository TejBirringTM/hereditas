import config from "../../config.ts";
import { DenoKvCache } from "../cache/deno-kv-cache.ts";

const kv = await Deno.openKv();

export const denoKvCache = new DenoKvCache(kv, {
  ttlInMilliseconds: config.cache.ttlInMilliseconds,
  maxEntries: Infinity,
});

// make sure to clear KV store before using it as state persists beyond lifetime of the process
denoKvCache.clear();
