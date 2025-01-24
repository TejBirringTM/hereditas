import { AirtableSync } from "../../../common/airtable-data-sync/main.ts";
import { airtableDownloadSchema } from "../../../common/airtable/schemas.ts";
import config from "../../../config.ts";
import * as v from "@valibot/valibot";

const recordSchema_type = v.union([
  v.literal("Product Update"),
  v.literal("Lineage"),
  v.literal("Article"),
]);

export const recordSchema_content = v.object({
  Title: v.optional(v.string()),
  Type: v.optional(recordSchema_type),
  Tags: v.optional(v.array(v.string())),
  Content: v.optional(v.string()),
  Downloads: v.optional(v.array(airtableDownloadSchema)),
  Images: v.optional(v.array(airtableDownloadSchema)),
  "Feature Image": v.optional(v.array(airtableDownloadSchema)),
  Created: v.string(),
  "Last Modified": v.optional(v.string()),
  "Published": v.optional(v.boolean()),
  Codex: v.optional(v.string()),
  "Author Names": v.optional(v.array(v.string())),
  Footnotes: v.optional(v.string()),
  References: v.optional(v.string()),
  Acknowledgements: v.optional(v.string()),
});

export const tableContent = new AirtableSync(
  "apph4b8oGTIzV49FI",
  "tbl9LNpWurK4GixEh",
  {
    ttlInMilliseconds: config.cache.ttlInMilliseconds,
    selectOptions: {
      filterByFormula: "AND({Published} = TRUE(), 1)",
      sort: [
        {
          field: "Created",
          direction: "desc",
        },
      ],
    },
  },
  recordSchema_content,
);
