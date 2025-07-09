import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { MarkerPosition } from '../models/MarkerPosition';

/**
 * State Definition
 */
interface ChatSlice {
  player1HandPos?: MarkerPosition;
  player2HandPos?: MarkerPosition;
  player3HandPos?: MarkerPosition;
  player4HandPos?: MarkerPosition;
}
const initialState: ChatSlice = {

};

/**
 * Reducers & Actions Definitions
 */
export const positionSlice = createSlice({
  name: 'positionSlice',
  initialState,
  reducers: {

    setPlayer1HandPos: (state, action: PayloadAction<MarkerPosition | undefined>) => {
      state.player1HandPos = action.payload;
    },

    setPlayer2HandPos: (state, action: PayloadAction<MarkerPosition | undefined>) => {
      state.player2HandPos = action.payload;
    },

    setPlayer3HandPos: (state, action: PayloadAction<MarkerPosition | undefined>) => {
      state.player3HandPos = action.payload;
    },

    setPlayer4HandPos: (state, action: PayloadAction<MarkerPosition | undefined>) => {
      state.player4HandPos = action.payload;
    },


  }
});

/**
 * Exports
 */
// Reducer
export default positionSlice.reducer;
// Actions
export const {
  setPlayer1HandPos,
  setPlayer2HandPos,
  setPlayer3HandPos,
  setPlayer4HandPos
} = positionSlice.actions;

// Selectors

export const getPlayer1HandPos = (state: RootState): MarkerPosition | undefined => state.positionSlice.player1HandPos;

export const getPlayer2HandPos = (state: RootState): MarkerPosition | undefined => state.positionSlice.player2HandPos;

export const getPlayer3HandPos = (state: RootState): MarkerPosition | undefined => state.positionSlice.player3HandPos;

export const getPlayer4HandPos = (state: RootState): MarkerPosition | undefined => state.positionSlice.player4HandPos;
