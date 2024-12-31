import {AirtableSync} from "../../../common/airtable-data-sync/main.ts";
import { airtableDownloadSchema } from "../../../common/airtable/schemas.ts";
import config from "../../../config.ts";
import * as v from "@valibot/valibot";
import { deflate } from "../../tokeniser/model/tokeniser.ts";

export const recordSchema_codexExample = v.object({
    Title: v.optional(v.string()),
    "Alternative Titles": v.optional(v.string()),
    Description: v.optional(v.string()),
    Tags: v.optional(v.array(v.string())),
    Images: v.optional(v.array(airtableDownloadSchema)),
    Codex: v.optional(v.string()),
    Acta: v.optional(v.string()),
    "Presenter's Name": v.optional(v.string()),
    "Presenter's Email Address": v.optional(v.string()),
    Created: v.string(),
    "Last Modified": v.optional(v.string()),
    "Published": v.optional(v.boolean())
});

export const tableCodexExamples = new AirtableSync("apph4b8oGTIzV49FI", "tbloaAY6XXbvN5Wfb", {ttlInMilliseconds: config.cache.ttlInMilliseconds, selectOptions: {filterByFormula: "{Published} = TRUE()"}}, recordSchema_codexExample, async (input)=>{
    return {
        ...input,
        token: await deflate(input.Codex ?? "")
    }
});
