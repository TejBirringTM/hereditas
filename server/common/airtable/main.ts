import airtable, { FieldSet, SelectOptions } from "npm:airtable";
import config from "../../config.ts";
import * as v from "@valibot/valibot";
import { RetrievalFailedError } from "../../errors/db.ts";
import { ValidationFailedError } from "../../errors/validation.ts";
import { dumpError } from "../error-handling.ts";

if (!config.external.airtable.apiKey) {
  throw new Error("AIRTABLE_PERSONAL_ACCESS_TOKEN not set!");
}

airtable.configure({
  apiKey: config.external.airtable.apiKey,
});

export function airtableBase(baseId: string) {
  const base = airtable.base(baseId);
  return base;
}

export function airtableTable(baseId: string, tableId: string) {
  const table = airtable.base(baseId)(tableId);
  return table;
}

const recordBaseSchema = v.object({
  id: v.string(),
});

export async function airtableRecord<
  TEntries extends v.ObjectEntries,
  TMessage extends v.ErrorMessage<v.ObjectIssue> | undefined,
>(
  baseId: string,
  tableId: string,
  recordId: string,
  recordSchema: v.ObjectSchema<TEntries, TMessage>,
) {
  let json: { fields?: unknown };
  try {
    const table = airtableTable(baseId, tableId);
    const record = await table.find(recordId);
    json = record._rawJson;
  } catch (e) {
    dumpError(e);
    throw RetrievalFailedError.create("Failed to fetch record.");
  }
  try {
    const { id } = v.parse(recordBaseSchema, json);
    const fields = v.parse(recordSchema, json.fields);
    const result = {
      id,
      ...fields,
    };
    // console.debug(result);
    return result;
  } catch (e) {
    dumpError(e);
    console.error("received json:\n", json);
    throw ValidationFailedError.create("Failed to parse record.");
  }
}

export async function airtableRecords<
  TEntries extends v.ObjectEntries,
  TMessage extends v.ErrorMessage<v.ObjectIssue> | undefined,
>(
  baseId: string,
  tableId: string,
  queryParams: SelectOptions<FieldSet>,
  recordSchema: v.ObjectSchema<TEntries, TMessage>,
) {
  let jsons: { fields?: unknown }[];
  try {
    const table = airtableTable(baseId, tableId);
    const records = await table.select(queryParams).all();
    jsons = records.map((r) => r._rawJson);
  } catch (e) {
    dumpError(e);
    throw RetrievalFailedError.create("Failed to fetch records.");
  }
  try {
    const result: v.InferOutput<
      typeof recordSchema & typeof recordBaseSchema
    >[] = [];
    for (const json of jsons) {
      const { id } = v.parse(recordBaseSchema, json);
      const fields = v.parse(recordSchema, json.fields);
      result.push({
        id,
        ...fields,
      });
    }
    // console.debug(result);
    return result;
  } catch (e) {
    dumpError(e);
    console.error("received jsons:\n", jsons);
    throw ValidationFailedError.create("Failed to parse record.");
  }
}
