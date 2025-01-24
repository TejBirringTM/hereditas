import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as v from "valibot";
import { type RootState } from "../../../store";
type Nullable<T> = T | null;

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

const schemaContentRecord = v.object({
    id: v.string(),
    Title: v.optional(v.string()),
    Type: v.optional(v.union([
      v.literal("Product Update"),
      v.literal("Lineage"),
      v.literal("Article"),
    ])),
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
export type ContentRecord = v.InferOutput<typeof schemaContentRecord>;

const contentSlice = createSlice({
    name: 'content',
    initialState: {
      content: null as Nullable<ContentRecord[]>,
      activeContent: null as Nullable<ContentRecord>,
    },
    reducers: {  
      setContent: (state, action: PayloadAction<{contentRecords: ContentRecord[]}>) => {
        state.content = action.payload.contentRecords;
      },
      setActiveContent: (state, action: PayloadAction<{contentRecord?: ContentRecord | null}>) => {
        if (action.payload.contentRecord) {
          state.activeContent = action.payload.contentRecord;
        } else {
          state.activeContent = null;
        }
      },
    },
    selectors: {
      selectContent: (state)=>state.content,
      selectActiveContent: (state)=>state.activeContent,
    }
  });

export const {setContent, setActiveContent} = contentSlice.actions;
export const {selectContent, selectActiveContent} = contentSlice.selectors;
export default contentSlice.reducer;


  export const fetchContent = createAsyncThunk("content/fetch/content", async (_, thunkApi)=>{
    const currentContent = (thunkApi.getState() as RootState).content.content;
    if (!currentContent) {
      console.debug("No content found, fetching content...");
      // we need a way to prevent multiple consecutive calls thus, we ensure that this condition evaluates to false
      void thunkApi.dispatch(setContent({contentRecords: []}));
      //
      const contentRecords = await fetchContentFromServer();
      void thunkApi.dispatch(setContent({contentRecords}));
    }
  });

  async function fetchContentFromServer() {
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL ?? "*"}/services/app-content/content/v1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: "{\n}"
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json : {data?: {records?: unknown}} = await response.json();
    const parseResult = v.safeParse(v.object({
      data: v.object({
        records: v.array(schemaContentRecord)
      })
    }), json);
    if (parseResult.success) {
      return parseResult.output.data.records;
    } else {
      console.error("Failed to parse content!", parseResult.issues);
      // if error in fetched data, we do our best to ignore it after logging
      if (json?.data?.records) {
        return json.data.records as ContentRecord[];
      } else {
        return [];
      }
    }
}
