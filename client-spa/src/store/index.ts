import { configureStore } from '@reduxjs/toolkit'
import familyTreeEntry from '../routes/feature:family-tree-entry-and-visualisation/slice';
import content from "../content/slice"

const store = configureStore({
    reducer: {
        familyTreeEntry,
        content
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
