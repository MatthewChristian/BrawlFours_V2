import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { PlayerSocket } from '../models/PlayerSocket';
import { DeckCard } from '../models/DeckCard';



/**
 * State Definition
 */
interface GameSlice {
  playerList: PlayerSocket[];
  roomId?: string;
  joinModalOpen: boolean;
  errorMsg?: string;
  deck: DeckCard[];
  kickedCards: DeckCard[];
  playerCards: DeckCard[];
  dealer?: number;
  turn?: number;
  beg?: 'begging' | 'begged' | 'stand';
}
const initialState: GameSlice = {
  playerList: [],
  joinModalOpen: false,
  deck: [],
  kickedCards: [],
  playerCards: []
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

    setRoomId: (state, action: PayloadAction<string | undefined>) => {
      state.roomId = action.payload;
    },

    setJoinModalOpen: (state, action: PayloadAction<boolean>) => {
      state.joinModalOpen = action.payload;
    },

    setErrorMsg: (state, action: PayloadAction<string | undefined>) => {
      state.errorMsg = action.payload;
    },

    setDeck: (state, action: PayloadAction<DeckCard[]>) => {
      state.deck = action.payload;
    },

    setKickedCards: (state, action: PayloadAction<DeckCard[]>) => {
      state.kickedCards = action.payload;
    },

    setPlayerCards: (state, action: PayloadAction<DeckCard[]>) => {
      state.playerCards = action.payload;
    },

    setDealer: (state, action: PayloadAction<number>) => {
      state.dealer = action.payload;
    },

    setTurn: (state, action: PayloadAction<number>) => {
      state.turn = action.payload;
    },

    setBeg: (state, action: PayloadAction<'begging' | 'begged' | 'stand' | undefined>) => {
      state.beg = action.payload;
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
  setRoomId,
  setErrorMsg,
  setJoinModalOpen,
  setDeck,
  setKickedCards,
  setPlayerCards,
  setBeg,
  setDealer,
  setTurn
} =  gameSlice.actions;

// Selectors

export const getPlayerList = (state: RootState): PlayerSocket[] => state.gameSlice.playerList;

export const getRoomId = (state: RootState): string | undefined => state.gameSlice.roomId;

export const getJoinModalOpen = (state: RootState): boolean => state.gameSlice.joinModalOpen;

export const getErrorMsg = (state: RootState): string | undefined => state.gameSlice.errorMsg;

export const getDeck = (state: RootState): DeckCard[] => state.gameSlice.deck;

export const getKickedCards = (state: RootState): DeckCard[] => state.gameSlice.kickedCards;

export const getPlayerCards = (state: RootState): DeckCard[] => state.gameSlice.playerCards;

export const getDealer = (state: RootState): number => state.gameSlice.dealer;

export const getTurn = (state: RootState): number => state.gameSlice.turn;

export const getBeg = (state: RootState): 'begging' | 'begged' | 'stand' | undefined => state.gameSlice.beg;