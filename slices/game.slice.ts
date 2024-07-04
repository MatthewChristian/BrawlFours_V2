import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { PlayerSocket } from '../models/PlayerSocket';



/**
 * State Definition
 */
interface GameSlice {
  playerList: PlayerSocket[];
}
const initialState: GameSlice = {
  playerList: []
};

/**
 * Reducers & Actions Definitions
 */
export const gameSlice = createSlice({
  name: 'gameSlice',
  initialState,
  reducers: {

    setPlayerList: (state, action: PayloadAction<PlayerSocket[]>) => {
      state.playerList = action.payload;
    },

  }
});

/**
 * Exports
 */
// Reducer
export default gameSlice.reducer;
// Actions
export const {
  setPlayerList,
} =  gameSlice.actions;

// Selectors

export const getPlayerList = (state: RootState): PlayerSocket[] => state.gameSlice.playerList;
