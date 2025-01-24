import { configureStore } from '@reduxjs/toolkit'
import familyTreeEntry from '../routes/feature:family-tree-entry-and-visualisation/slice';
import content from "../routes/feature:content/slice"

const store = configureStore({
    reducer: {
        familyTreeEntry,
        content
    }
});
console.debug("State initialised.");

export default store;
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
