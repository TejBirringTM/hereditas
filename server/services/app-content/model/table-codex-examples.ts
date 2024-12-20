import {AirtableSync} from "../../../common/airtable-data-sync/main.ts";
import config from "../../../config.ts";
import * as v from "@valibot/valibot";

export const recordSchema_codexExample = v.object({
    Title: v.optional(v.string()),
    Description: v.optional(v.string()),
    Codex: v.optional(v.string()),
    Acta: v.optional(v.string()),
    Created: v.string(),
    "Last Modified": v.optional(v.string()),
    "Published": v.optional(v.boolean())
});

export const tableCodexExamples = new AirtableSync("apph4b8oGTIzV49FI", "tbloaAY6XXbvN5Wfb", {ttlInMilliseconds: config.cache.ttlInMilliseconds, selectOptions: {filterByFormula: ""}}, recordSchema_codexExample);
