import {AirtableSync} from "../../../common/airtable-data-sync/main.ts";
import config from "../../../config.ts";
import * as v from "@valibot/valibot";

export const recordSchema_codexSubmission = v.object({
    Title: v.optional(v.string()),
    Description: v.optional(v.string()),
    Codex: v.optional(v.string()),
    "Presenter Name": v.optional(v.string()),
    "Presenter Email": v.optional(v.string()),
    "Hide Presenter Email": v.optional(v.boolean()),
    Created: v.string(),
    "Last Modified": v.optional(v.string()),
    "Approved": v.optional(v.boolean())
});

export const tableCodexSubmissions = new AirtableSync("apph4b8oGTIzV49FI", "tblz7CyEockMSBhlw", {ttlInMilliseconds: config.cache.ttlInMilliseconds, selectOptions: { filterByFormula: "{Approved} = TRUE()" }}, recordSchema_codexSubmission);
