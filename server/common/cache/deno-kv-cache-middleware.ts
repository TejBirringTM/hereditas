import { RouteParams, RouterContext, State } from "@oak/oak";
import { DenoKvCache } from "./deno-kv-cache.ts";
import { RequestHasher } from "../request-hasher.ts";

// Synchronous version for basic types
function getJsonSizeSync(value: unknown): number {
  // Handle Set
  if (value instanceof Set) {
    value = Array.from(value);
  }

  // Handle Map
  if (value instanceof Map) {
    value = Object.fromEntries(value);
  }

  // Handle Date
  if (value instanceof Date) {
    value = value.toISOString();
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    value = {
      source: value.source,
      flags: value.flags,
    };
  }

  // Handle Error
  if (value instanceof Error) {
    value = {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  // Handle ArrayBuffer and TypedArrays
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    value = Array.from(
      new Uint8Array(value instanceof ArrayBuffer ? value : value.buffer),
    );
  }

  // Handle function by taking its string representation
  if (typeof value === "function") {
    value = value.toString();
  }

  // Handle symbol by taking its description
  if (typeof value === "symbol") {
    value = value.description;
  }

  try {
    const jsonString = JSON.stringify(value);
    return new TextEncoder().encode(jsonString).length;
  } catch (error) {
    throw new Error(`Cannot JSON serialize value: ${error.message}`);
  }
}

// Async version for types that require awaiting
async function getJsonSize(value: unknown): Promise<number> {
  // Handle promises by awaiting them
  if (value instanceof Promise) {
    value = await value;
  }

  // Special handling for Response objects
  if (value instanceof Response) {
    const clonedResponse = value.clone();
    try {
      value = await clonedResponse.json();
    } catch {
      value = await clonedResponse.text();
    }
  }

  // Special handling for Blob and File objects
  if (value instanceof Blob) {
    try {
      value = await value.text();
    } catch {
      value = { size: value.size, type: value.type };
    }
  }

  // Handle FormData
  if (value instanceof FormData) {
    const obj: Record<string, unknown> = {};
    for (const [key, val] of value.entries()) {
      if (val instanceof File || val instanceof Blob) {
        obj[key] = {
          name: val instanceof File ? val.name : "blob",
          size: val.size,
          type: val.type,
        };
      } else {
        obj[key] = val;
      }
    }
    value = obj;
  }

  // Handle URLSearchParams
  if (value instanceof URLSearchParams) {
    const obj: Record<string, string[]> = {};
    for (const [key, val] of value.entries()) {
      if (key in obj) {
        obj[key].push(val);
      } else {
        obj[key] = [val];
      }
    }
    value = obj;
  }

  // Handle ReadableStream
  if (value instanceof ReadableStream) {
    const response = new Response(value);
    try {
      value = await response.json();
    } catch {
      value = await response.text();
    }
  }

  // Use the sync version for the final calculation
  return getJsonSizeSync(value);
}

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
    console.dir(ctx.response.body, { depth: Infinity });

    if (ctx.response.status === 200) {
      const size = await getJsonSize(ctx.response.body);
      if (size <= 65536) {
        await cache.set(cacheKey, ctx.response.body);
      }
    }
  };
}
