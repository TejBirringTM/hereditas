import * as v from "@valibot/valibot";
import { AirtableSync } from "./main.ts";
import { assert } from "@std/assert";
import { sleep } from "../sleep.ts";

const TEST_BASE_ID = "apph4b8oGTIzV49FI";
const TEST_TABLE_NAME = "Family Tree (Codex) Examples";
const TEST_RECORD_SCHEMA = v.object({
  Title: v.string(),
  Description: v.string(),
});

const TTL = 0.5 * 60 * 1000; /* 30 secs in milliseconds */

Deno.test(async function AirtableDataSync() {
  const tableSync = new AirtableSync(TEST_BASE_ID, TEST_TABLE_NAME, {
    ttlInMilliseconds: TTL,
  }, TEST_RECORD_SCHEMA);
  let records = await tableSync.records();
  const ts1 = tableSync.lastFetch;
  assert(records.length > 0);
  await sleep(TTL + 10);
  records = await tableSync.records();
  const ts2 = tableSync.lastFetch;
  assert(records.length > 0);
  assert(ts2 > ts1);
});
