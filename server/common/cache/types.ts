import { Nullable } from "../../types.ts";

export interface CacheOptions {
  /** Time-to-live in milliseconds */
  ttlInMilliseconds: number;
  /** Maximum number of entries in cache */
  maxEntries: number;
}

export interface CacheEntry {
  value: unknown;
  timestamp: number;
}

export interface ICache {
  get(key: string): Promise<Nullable<unknown>>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string, reason: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
  // stats(): Promise<unknown>;
}
