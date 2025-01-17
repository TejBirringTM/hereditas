import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as v from "valibot";
type Nullable<T> = T | null;
import { type RootState } from '../../store';

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

const schemaCodexExample = v.object({
    id: v.string(),
    Title: v.optional(v.string()),
    token: v.string(),
    "Alternative Titles": v.optional(v.string()),
    "Presenter's Name": v.optional(v.string()),
    "Presenter's Email Address": v.optional(v.string()),
    Description: v.optional(v.string()),
    Tags: v.optional(v.array(v.string())),
    Images: v.optional(v.array(airtableDownloadSchema)),
    Codex: v.optional(v.string()),
    Acta: v.optional(v.string()),
    Created: v.string(),
    "Last Modified": v.optional(v.string()),
    "Published": v.optional(v.boolean())
});
type CodexExample = v.InferOutput<typeof schemaCodexExample>;

interface FamilyTreeSubmission {
  id: string,
}

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
});
type ContentRecord = v.InferOutput<typeof schemaContentRecord>;

const contentSlice = createSlice({
    name: 'content',
    initialState: {
      codexExamples: null as Nullable<CodexExample[]>,
      codexSubmissions: null as Nullable<FamilyTreeSubmission[]>,
      content: null as Nullable<ContentRecord[]>
    },
    reducers: {  
      setCodexExamples: (state, action: PayloadAction<{codexExamples: CodexExample[]}>) => {
        state.codexExamples = action.payload.codexExamples;
      },
      setCodexSubmissions: (state, action: PayloadAction<{codexSubmissions: CodexExample[]}>) => {
        state.codexSubmissions = action.payload.codexSubmissions;
      },
      setContent: (state, action: PayloadAction<{contentRecords: ContentRecord[]}>) => {
        state.content = action.payload.contentRecords;
      },
    },
    selectors: {
      selectCodexExamples: (state)=>state.codexExamples,
      selectCodexSubmissions: (state)=>state.codexSubmissions,
      selectContent: (state)=>state.content,
    }
  });

export const {setCodexExamples, setCodexSubmissions, setContent} = contentSlice.actions;
export const {selectCodexExamples, selectCodexSubmissions, selectContent} = contentSlice.selectors;
export default contentSlice.reducer;

  export const fetchContentCodexExamples = createAsyncThunk("content/fetch/codex-examples", async (_, thunkApi)=>{
    const codexExamples = selectCodexExamples(thunkApi.getState() as RootState);
    if (!codexExamples) {
        const records = await fetchCodexExamples();
        thunkApi.dispatch(setCodexExamples({codexExamples: records}));
    }
  });

  export const fetchContent = createAsyncThunk("content/fetch/content", async (_, thunkApi)=>{
    const content = selectContent(thunkApi.getState() as RootState);
    if (!content) {
        const records = await fetchContentFromServer();
        thunkApi.dispatch(setContent({contentRecords: records}));
    }
  });

  function fetchCodexExamples() {
      return fetch(`${import.meta.env.VITE_SERVER_URL ?? "*"}/services/app-content/codex-examples/v1`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
          },
          body: "{\n}"
      }).then((response)=>{
          return response.json();
      }).then((json)=>{
        console.debug(json)
          const parseResult = v.safeParse(v.object({
                data: v.object({
                    records: v.array(schemaCodexExample)
                })
            }), json);
            console.debug(parseResult);
          if (!parseResult.success) {
              console.error(parseResult.issues)
              throw new Error("Failed to parse content!"); // response could not be validated using the above schema
          } else {
              return parseResult.output.data.records;
          }
      })
  }

  export function fetchContentFromServer() {
    return fetch(`${import.meta.env.VITE_SERVER_URL ?? "*"}/services/app-content/content/v1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: "{\n}"
    }).then((response)=>{
        return response.json();
    }).then((json)=>{
      console.debug(json)
        const parseResult = v.safeParse(v.object({
              data: v.object({
                  records: v.array(schemaContentRecord)
              })
          }), json);
          console.debug(parseResult);
        if (!parseResult.success) {
            console.error(parseResult.issues)
            throw new Error("Failed to parse content!"); // response could not be validated using the above schema
        } else {
            return parseResult.output.data.records;
        }
    })
}
