import { DenoKvCache } from "../cache/deno-kv-cache.ts";

const kv = await Deno.openKv();
export const denoKvCache = new DenoKvCache(kv, {
    ttl: 60 * 60 * 1000, // 1 hour in milliseconds
    maxEntries: Infinity
});
