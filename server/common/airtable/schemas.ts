import * as v from "@valibot/valibot";

export const airtableDownloadThumbnailSchema = v.object({
    url: v.string(),
    width: v.number(),
    height: v.number()
});

export const airtableDownloadThumbnailsSchema = v.object({
    small: airtableDownloadThumbnailSchema,
    large: airtableDownloadThumbnailSchema,    
});

export const airtableDownloadSchema = v.object({
    id: v.string(),
    url: v.string(),
    filename: v.string(),
    size: v.number(), // in bytes
    type: v.string(), // MIME type
    // available for images
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    thumbnails: airtableDownloadThumbnailsSchema
})
