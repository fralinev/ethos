import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Types — auto-inferred by RTK
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
