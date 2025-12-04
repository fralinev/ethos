import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  isChatLoading: boolean;
  // loadingChatId: number | null;
};

const initialState: UiState = {
  isChatLoading: false,
  // loadingChatId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startChatLoading(state) {
      state.isChatLoading = true;
      // state.loadingChatId = action.payload;
    },
    finishChatLoading(state) {
      state.isChatLoading = false;
      // state.loadingChatId = null;
    },
  },
});

export const { startChatLoading, finishChatLoading } = uiSlice.actions;
export default uiSlice.reducer;
