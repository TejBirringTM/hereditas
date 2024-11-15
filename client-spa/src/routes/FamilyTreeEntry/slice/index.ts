import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Graph } from '../libs/parse-family-tree-entry';
// const localStorageKey_textEntry = "family-tree-user-entry";

const familyTreeEntrySlice = createSlice({
  name: 'familyTreeEntry',
  initialState: {
    textEntry: "",
    errorMessage: "",
    graph: null as Graph | null,
  },
  reducers: {
    setTextEntry: (state, action: PayloadAction<string>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.textEntry = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setGraph: (state, action: PayloadAction<Graph>) => {
      state.graph = action.payload;
    },
    reset: (state) => {
      state.textEntry = "";
      state.graph = null;
      state.errorMessage = "";
    },
  },
});

export const {setTextEntry, setErrorMessage, setGraph, reset} = familyTreeEntrySlice.actions;
export default familyTreeEntrySlice.reducer;
