import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userId: string | null;
  name: string | null;
}

const initialState: UserState = {
  userId: null,
  name: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ userId: string; name: string }>) {
      state.userId = action.payload.userId;
      state.name = action.payload.name;
    },
    clearUser(state) {
      state.userId = null;
      state.name = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
