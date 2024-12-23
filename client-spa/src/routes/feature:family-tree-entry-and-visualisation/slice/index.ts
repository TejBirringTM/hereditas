import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {Graph, parseFamilyTree} from '../libs/parse-family-tree';
import {scribeFamilyTree} from '../libs/scribe-family-tree';
import type { RootState } from '../../../store';
import { detokeniseString, tokeniseString } from '../../../libs/tokenise';

export const localStorageKey_codex = "family-tree-user-entry-codex";
export const localStorageKey_acta = "family-tree-user-entry-acta";
export const urlSearchKey_familyTreeToken = "ftt";

export type FamilyTreeVisualisationState = "drawn" | "error" | "start" | "editing";

const familyTreeEntrySlice = createSlice({
  name: 'familyTreeEntry',
  initialState: {
    acta: "",
    codex: "",
    errorMessage: "",
    graph: null as (Graph | null),
    token: "",
    state: "start" as FamilyTreeVisualisationState
  },
  reducers: {
    setActa: (state, action: PayloadAction<{acta: string, persistToLocalStorage: boolean}>) => {
      state.acta = action.payload.acta;
      if (action.payload.persistToLocalStorage) {
        localStorage.setItem(localStorageKey_acta, action.payload.acta);
      }
      state.state = "start";
    },

    setCodex: (state, action: PayloadAction<{codex: string, persistToLocalStorage: boolean}>) => {
      state.codex = action.payload.codex;
      if (action.payload.persistToLocalStorage) {
        localStorage.setItem(localStorageKey_codex, action.payload.codex);
      }
      state.state = "editing";
    },

    resetFamilyTreeEntry: (state, action: PayloadAction<{clearTextEntry: boolean}>) => {
      state.token = "";
      state.graph = null;
      state.errorMessage = "";
      state.state = "start";
      if (action.payload.clearTextEntry) {
        state.acta = "";
        state.codex = "";
        localStorage.removeItem(localStorageKey_acta);
        localStorage.removeItem(localStorageKey_codex);
      }
    },
  },
  selectors: {
    selectFamilyTreeActa: (state)=>state.acta,
    selectFamilyTreeCodex: (state)=>state.codex,
    selectFamilyTreeGraph: (state)=>state.graph,
    selectFamilyTreeToken: (state)=>state.token,
    selectFamilyTreeState: (state)=>state.state,
    selectFamilyTreeErrorMessage: (state)=>state.errorMessage
  },
  extraReducers: (builder)=>{
    builder.addCase(processActa.rejected, (state, action)=>{
      if (action.payload && typeof action.payload === "string") {
        state.errorMessage = action.payload;
        state.state = "error";
      }
    });
    builder.addCase(processCodex.rejected, (state, action)=>{
      if (action.payload && typeof action.payload === "string") {
        state.errorMessage = action.payload;
        state.state = "error";
      }
    });
    builder.addCase(processCodex.fulfilled, (state, action)=>{
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
      void thunkApi.dispatch(setActa({acta: "", persistToLocalStorage: false}));
      void thunkApi.dispatch(setCodex({codex: familyTreeEntry, persistToLocalStorage: false}));
      void thunkApi.dispatch(processCodex({persistTextEntryToLocalStorage: false}));
      return;
  }
  // otherwise, see if family tree info has been saved to local storage
  const codexFromLocalStorage = localStorage.getItem(localStorageKey_codex);
  const actaFromLocalStorage = localStorage.getItem(localStorageKey_acta);
  if (codexFromLocalStorage) {  
    void thunkApi.dispatch(setCodex({codex: codexFromLocalStorage, persistToLocalStorage: false}));
  }
  if (actaFromLocalStorage) {
    void thunkApi.dispatch(setActa({acta: actaFromLocalStorage, persistToLocalStorage: false}));
  }
});

export const processCodex = createAsyncThunk("familyTreeEntry/processCodex", async ({persistTextEntryToLocalStorage}: {persistTextEntryToLocalStorage: boolean}, thunkApi)=>{
  try {
    const codex = selectFamilyTreeCodex(thunkApi.getState() as RootState);
    const graph = await parseFamilyTree(codex);
    const token = await tokeniseString(codex);
    void thunkApi.dispatch(setCodex({codex, persistToLocalStorage: persistTextEntryToLocalStorage}));
    return thunkApi.fulfillWithValue({
      graph,
      token
    });
} catch (e) {
    const errorMessage = (e instanceof Error) ? e.message : (typeof e === "string") ? e : undefined;
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const processActa = createAsyncThunk("familyTreeEntry/processActa", async ({persistTextEntryToLocalStorage}: {persistTextEntryToLocalStorage: boolean}, thunkApi)=>{
  try {
    const acta = selectFamilyTreeActa(thunkApi.getState() as RootState);
    // get codex text entry from acta, from server
    const codex = await scribeFamilyTree(acta);
    thunkApi.dispatch(setCodex({codex, persistToLocalStorage: persistTextEntryToLocalStorage}));
    // now resolve for codex
    await thunkApi.dispatch(processCodex({persistTextEntryToLocalStorage}));
    return thunkApi.fulfillWithValue({});
  } catch (e) {
    const errorMessage = (e instanceof Error) ? e.message : (typeof e === "string") ? e : undefined;
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const {setActa, setCodex, resetFamilyTreeEntry} = familyTreeEntrySlice.actions;
export const {selectFamilyTreeActa, selectFamilyTreeCodex, selectFamilyTreeGraph, selectFamilyTreeToken, selectFamilyTreeState, selectFamilyTreeErrorMessage} = familyTreeEntrySlice.selectors;
export default familyTreeEntrySlice.reducer;
