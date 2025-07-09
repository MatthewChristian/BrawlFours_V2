import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { ChatMessage } from '../models/ChatMessage';
import { ChatInput } from '../models/ChatInput';



/**
 * State Definition
 */
interface ChatSlice {
  chatMessages: ChatMessage[];
  chatMode: ChatInput['mode'];
}
const initialState: ChatSlice = {
  chatMessages: [],
  chatMode: 'team'
};

/**
 * Reducers & Actions Definitions
 */
export const chatSlice = createSlice({
  name: 'chatSlice',
  initialState,
  reducers: {

    setChatMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.chatMessages = action.payload;
    },

    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatMessages.push(action.payload);
    },

    setChatMode: (state, action: PayloadAction<ChatInput['mode']>) => {
      state.chatMode = action.payload;
    },

  }
});

/**
 * Exports
 */
// Reducer
export default chatSlice.reducer;
// Actions
export const {
  setChatMessages,
  addChatMessage,
  setChatMode,
} = chatSlice.actions;

// Selectors

export const getChatMessages = (state: RootState): ChatMessage[] => state.chatSlice.chatMessages;

export const getChatMode = (state: RootState): ChatInput['mode'] => state.chatSlice.chatMode;
