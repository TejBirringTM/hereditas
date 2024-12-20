import {AirtableSync} from "../../../common/airtable-data-sync/main.ts";
import { airtableDownloadSchema } from "../../../common/airtable/schemas.ts";
import config from "../../../config.ts";
import * as v from "@valibot/valibot";

export const recordSchema_newsItem = v.object({
    Title: v.optional(v.string()),
    Content: v.optional(v.string()),
    Tags: v.optional(v.array(v.string())),
    Downloads: v.optional(v.array(airtableDownloadSchema)),
    Images: v.optional(v.array(airtableDownloadSchema)),
    "Feature Image": v.optional(v.array(airtableDownloadSchema)),
    Category: v.optional(v.string()),
    Created: v.string(),
    "Last Modified": v.optional(v.string()),
    "Published": v.optional(v.boolean()),
});

export const tableNewsItems = new AirtableSync("apph4b8oGTIzV49FI", "tbl9LNpWurK4GixEh", {ttlInMilliseconds: config.cache.ttlInMilliseconds}, recordSchema_newsItem);
