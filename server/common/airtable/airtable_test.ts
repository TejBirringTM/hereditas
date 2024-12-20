import * as v from "@valibot/valibot";
import { airtableRecord, airtableRecords } from "./main.ts";
import { assert } from "@std/assert";

const TEST_BASE_ID = "apph4b8oGTIzV49FI";
const TEST_TABLE_NAME = "Family Tree (Codex) Examples";
const TEST_RECORD_ID = "rectkt13E3PS7YtMb";
const TEST_RECORD_SCHEMA = v.object({
  Title: v.string(),
  Description: v.string(),
});

Deno.test(async function testFetchRecord() {
  const rec = await airtableRecord(
    TEST_BASE_ID,
    TEST_TABLE_NAME,
    TEST_RECORD_ID,
    TEST_RECORD_SCHEMA,
  );
  assert(typeof rec.Title === "string" && typeof rec.Description === "string");
});

Deno.test(async function testFetchRecords() {
  const recs = await airtableRecords(
    TEST_BASE_ID,
    TEST_TABLE_NAME,
    {},
    TEST_RECORD_SCHEMA,
  );
  assert(Array.isArray(recs) && typeof recs[0] === "object");
});
