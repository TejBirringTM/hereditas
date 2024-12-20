import { Nullable } from "../../types.ts";
import debugOnly from "../framework/debug-only.ts";
import { CacheEntry } from "./types.ts";
import { CacheOptions, ICache } from "./types.ts";

export class DenoKvCache implements ICache {
  private readonly options: CacheOptions;
  private readonly kv: Deno.Kv;

  constructor(kv: Deno.Kv, options: CacheOptions) {
    this.kv = kv;
    this.options = options;
  }

  async get(key: string): Promise<Nullable<unknown>> {
    const entry = await this.kv.get<CacheEntry>([key]);

    if (!entry.value) {
      debugOnly(() => {
        console.debug(`Cache miss @ '${key}'`);
      });
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.value.timestamp > this.options.ttlInMilliseconds) {
      debugOnly(() => {
        console.debug(`Cache hit, but expired @ '${key}'`);
      });
      await this.delete(key, " expired (TTL exceeded)");
      return null;
    }

    debugOnly(() => {
      console.debug(`Cache hit @ '${key}'`);
    });
    return entry.value.value;
  }

  async delete(key: string, reason: string): Promise<void> {
    await this.kv.delete([key]);
    debugOnly(() => {
      console.debug(`Deleting cache entry @ '${key}' ∵ ${reason}`);
    });
  }

  async clear(): Promise<void> {
    console.debug("Clearing cache...");
    const iter = this.kv.list({ prefix: [] });
    for await (const entry of iter) {
      await this.kv.delete(entry.key);
    }
    debugOnly(() => {
      console.debug("Cache cleared");
    });
  }

  async count(): Promise<number> {
    let count = 0;
    const iter = this.kv.list({ prefix: [] });
    for await (const _ of iter) {
      count++;
    }
    return count;
  }

  // async stats() {
  //     const iter = this.kv.list({ prefix: [] });
  //     const entries : Record<string, unknown> = {};
  //     for await (const i of iter) {
  //         console.debug(i);
  //     }
  // }

  /**
   * LRU
   * Evict oldest entry based on timestamp
   */
  private async evictOldest(): Promise<void> {
    let oldestKey: Deno.KvKey | null = null;
    let oldestTimestamp = Infinity;

    const iter = this.kv.list<CacheEntry>({ prefix: [] });
    for await (const entry of iter) {
      if (entry.value.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.value.timestamp;
        oldestKey = entry.key;
      }
    }

    if (oldestKey) {
      await this.kv.delete(oldestKey);
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
    };

    // Enforce max entries limit
    const count = await this.count();
    if (count >= this.options.maxEntries) {
      await this.evictOldest();
    }

    console.debug(`Cache set @ '${key}'`);
    await this.kv.set([key], entry);
  }
}
