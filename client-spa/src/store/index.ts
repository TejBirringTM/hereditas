import { configureStore } from '@reduxjs/toolkit'
import familyTreeEntry from '../routes/FamilyTreeEntry/slice';

const store = configureStore({
    reducer: {
        familyTreeEntry
    }
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
