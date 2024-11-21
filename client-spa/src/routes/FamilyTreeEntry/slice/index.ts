import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import parseFamilyTreeEntry, { Graph } from '../libs/parse-family-tree-entry';
import { RootState } from '../../../store';
import { detokeniseString, tokeniseString } from '../libs/tokenise';
export const localStorageKey_textEntry = "family-tree-user-entry";
export const urlSearchKey_familyTreeToken = "ftt";

export type FamilyTreeVisualisationState = "drawn" | "error" | "unknown" | "editing";

const familyTreeEntrySlice = createSlice({
  name: 'familyTreeEntry',
  initialState: {
    textEntry: "",
    errorMessage: "",
    graph: null as (Graph | null),
    token: "",
    state: "unknown" as FamilyTreeVisualisationState
  },
  reducers: {
    setFamilyTreeTextEntry: (state, action: PayloadAction<{textEntry: string, persistToLocalStorage: boolean}>) => {
      state.textEntry = action.payload.textEntry;
      if (action.payload.persistToLocalStorage) {
        localStorage.setItem(localStorageKey_textEntry, action.payload.textEntry);
      }
      state.state = "editing";
    },

    resetFamilyTreeEntry: (state, action: PayloadAction<{clearTextEntry: boolean}>) => {
      state.token = "";
      state.graph = null;
      state.errorMessage = "";
      state.state = "editing";
      if (action.payload.clearTextEntry) {
        state.textEntry = "";
        localStorage.removeItem(localStorageKey_textEntry);
      }
    },
  },
  selectors: {
    selectFamilyTreeTextEntry: (state)=>state.textEntry,
    selectFamilyTreeGraph: (state)=>state.graph,
    selectFamilyTreeToken: (state)=>state.token,
    selectFamilyTreeState: (state)=>state.state,
    selectFamilyTreeErrorMessage: (state)=>state.errorMessage
  },
  extraReducers: (builder)=>{
    builder.addCase(processFamilyTreeTextEntry.rejected, (state, action)=>{
      if (action.payload && typeof action.payload === "string") {
        state.errorMessage = action.payload;
        state.state = "error";
      }
    });
    builder.addCase(processFamilyTreeTextEntry.fulfilled, (state, action)=>{
      const {graph, token} = action.payload;
      state.graph = graph;
      state.token = token;
      state.state = "drawn";
    })
  }
});

function getFamilyTreeTokenFromUrl() {
  const url = new URL(window.location.href);
  const familyTreeToken = url.searchParams.get(urlSearchKey_familyTreeToken);
  return familyTreeToken;
}

export const initialiseFamilyTreeEntry = createAsyncThunk("familyTreeEntry/initialiseFamilyTreeEntry", async (_, thunkApi)=>{
  // see if family tree token has been passed to the url
  const familyTreeToken = getFamilyTreeTokenFromUrl();
  if (familyTreeToken) {
      const familyTreeEntry = await detokeniseString(familyTreeToken);
      thunkApi.dispatch(setFamilyTreeTextEntry({textEntry: familyTreeEntry, persistToLocalStorage: false}));
      thunkApi.dispatch(processFamilyTreeTextEntry({persistTextEntryToLocalStorage: false}));
      return;
  }
  // otherwise, see if family tree has been saved to local storage
  const textEntryFromLocalStorage = localStorage.getItem(localStorageKey_textEntry);
  if (textEntryFromLocalStorage) {
    thunkApi.dispatch(setFamilyTreeTextEntry({textEntry: textEntryFromLocalStorage, persistToLocalStorage: false}));
  }
});

export const processFamilyTreeTextEntry = createAsyncThunk("familyTreeEntry/processFamilyTreeTextEntry", async ({persistTextEntryToLocalStorage}: {persistTextEntryToLocalStorage: boolean}, thunkApi)=>{
  try {
    const _familyTreeTextEntry = selectFamilyTreeTextEntry(thunkApi.getState() as RootState);
    const graph = await parseFamilyTreeEntry(_familyTreeTextEntry);
    const token = await tokeniseString(_familyTreeTextEntry);
    thunkApi.dispatch(setFamilyTreeTextEntry({textEntry: _familyTreeTextEntry, persistToLocalStorage: persistTextEntryToLocalStorage}));
    return thunkApi.fulfillWithValue({
      graph,
      token
    });
} catch (e) {
    const errorMessage = (e instanceof Error) ? e.message : (typeof e === "string") ? e : undefined;
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const {setFamilyTreeTextEntry, resetFamilyTreeEntry} = familyTreeEntrySlice.actions;
export const {selectFamilyTreeTextEntry, selectFamilyTreeGraph, selectFamilyTreeToken, selectFamilyTreeState, selectFamilyTreeErrorMessage} = familyTreeEntrySlice.selectors;
export default familyTreeEntrySlice.reducer;
