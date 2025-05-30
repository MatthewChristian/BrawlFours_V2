import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';
import { PlayerSocket } from '../models/PlayerSocket';
import { DeckCard } from '../models/DeckCard';
import { ServerMessage } from '../models/ServerMessage';
import { LiftCard } from '../models/LiftCard';
import { RoundWinners } from '../models/RoundWinners';
import { BegResponseInput } from '../models/BegResponseInput';
import { MatchWinner } from '../models/MatchWinner';
import { CardAbilities } from '../core/services/abilities';
import { PlayerStatus } from '../models/PlayerStatus';
import { RoomSocket } from '../models/RoomSocket';



/**
 * State Definition
 */
interface GameSlice {
  mobileView: boolean;
  playerList: PlayerSocket[];
  roomId?: string;
  joinModalOpen: boolean;
  errorMsg?: string;
  deck: DeckCard[];
  kickedCards: DeckCard[];
  playerCards: DeckCard[];
  teammateCards: DeckCard[];
  dealer?: number;
  turn?: number;
  beg?: BegResponseInput['response'];
  teamScore?: number[];
  message?: ServerMessage;
  lift: LiftCard[];
  game: number[];
  roundWinners?: RoundWinners;
  matchWinner?: MatchWinner;
  liftWinner?: number;
  gameStarted: boolean;
  playerJoinedRoom: boolean;
  activeAbilities: CardAbilities[];
  playerStatus: PlayerStatus[];
  twosPlayed: RoomSocket['twosPlayed'];
  revealedBare: boolean;
  doubleLiftCards: LiftCard[];
  doubleLiftModalVisible: boolean;
  gameIsTwo: boolean;
  settingsModalVisible: boolean;
  joinRoomLoading: boolean;
}

const initialState: GameSlice = {
  mobileView: false,
  playerList: [],
  joinModalOpen: false,
  deck: [],
  kickedCards: [],
  playerCards: [],
  teammateCards: [],
  teamScore: [0, 0],
  lift: [],
  game: [0, 0],
  gameStarted: false,
  playerJoinedRoom: false,
  activeAbilities: [],
  playerStatus: [],
  twosPlayed: [],
  revealedBare: false,
  doubleLiftCards: [],
  doubleLiftModalVisible: false,
  gameIsTwo: false,
  settingsModalVisible: false,
  joinRoomLoading: false,
};

/**
 * Reducers & Actions Definitions
 */
export const gameSlice = createSlice({
  name: 'gameSlice',
  initialState,
  reducers: {

    setMobileView: (state, action: PayloadAction<boolean>) => {
      state.mobileView = action.payload;
    },

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

    setTeammateCards: (state, action: PayloadAction<DeckCard[]>) => {
      state.teammateCards = action.payload;
    },

    setDealer: (state, action: PayloadAction<number>) => {
      state.dealer = action.payload;
    },

    setTurn: (state, action: PayloadAction<number>) => {
      state.turn = action.payload;
    },

    setBeg: (state, action: PayloadAction<BegResponseInput['response']>) => {
      state.beg = action.payload;
    },

    setTeamScore: (state, action: PayloadAction<number[]>) => {
      state.teamScore = action.payload;
    },

    setMessage: (state, action: PayloadAction<ServerMessage | undefined>) => {
      state.message = action.payload;
    },

    setLift: (state, action: PayloadAction<LiftCard[]>) => {
      state.lift = action.payload;
    },

    setGame: (state, action: PayloadAction<number[]>) => {
      state.game = action.payload;
    },

    setRoundWinners: (state, action: PayloadAction<RoundWinners | undefined>) => {
      state.roundWinners = action.payload;
    },

    setMatchWinner: (state, action: PayloadAction<MatchWinner>) => {
      state.matchWinner = action.payload;
    },

    setLiftWinner: (state, action: PayloadAction<number | undefined>) => {
      state.liftWinner = action.payload;
    },

    setGameStarted: (state, action: PayloadAction<boolean>) => {
      state.gameStarted = action.payload;
    },

    setPlayerJoinedRoom: (state, action: PayloadAction<boolean>) => {
      state.playerJoinedRoom = action.payload;
    },

    setActiveAbilities: (state, action: PayloadAction<CardAbilities[]>) => {
      state.activeAbilities = action.payload;
    },

    setPlayerStatus: (state, action: PayloadAction<PlayerStatus[]>) => {
      state.playerStatus = action.payload;
    },

    setTwosPlayed: (state, action: PayloadAction<RoomSocket['twosPlayed']>) => {
      state.twosPlayed = action.payload;
    },

    setRevealedBare: (state, action: PayloadAction<boolean>) => {
      state.revealedBare = action.payload;
    },

    setDoubleLiftCards: (state, action: PayloadAction<LiftCard[]>) => {
      state.doubleLiftCards = action.payload;
    },

    setDoubleLiftModalVisible: (state, action: PayloadAction<boolean>) => {
      state.doubleLiftModalVisible = action.payload;
    },

    setGameIsTwo: (state, action: PayloadAction<boolean>) => {
      state.gameIsTwo = action.payload;
    },

    setSettingsModalVisible: (state, action: PayloadAction<boolean>) => {
      state.settingsModalVisible = action.payload;
    },

    setJoinRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.joinRoomLoading = action.payload;
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
  setMobileView,
  setPlayerList,
  setRoomId,
  setErrorMsg,
  setJoinModalOpen,
  setDeck,
  setKickedCards,
  setPlayerCards,
  setTeammateCards,
  setBeg,
  setDealer,
  setTurn,
  setTeamScore,
  setMessage,
  setLift,
  setGame,
  setRoundWinners,
  setMatchWinner,
  setGameStarted,
  setLiftWinner,
  setPlayerJoinedRoom,
  setActiveAbilities,
  setPlayerStatus,
  setTwosPlayed,
  setRevealedBare,
  setDoubleLiftCards,
  setDoubleLiftModalVisible,
  setGameIsTwo,
  setSettingsModalVisible,
  setJoinRoomLoading,
} =  gameSlice.actions;

// Selectors

export const getMobileView = (state: RootState): boolean => state.gameSlice.mobileView;

export const getPlayerList = (state: RootState): PlayerSocket[] => state.gameSlice.playerList;

export const getRoomId = (state: RootState): string | undefined => state.gameSlice.roomId;

export const getJoinModalOpen = (state: RootState): boolean => state.gameSlice.joinModalOpen;

export const getErrorMsg = (state: RootState): string | undefined => state.gameSlice.errorMsg;

export const getDeck = (state: RootState): DeckCard[] => state.gameSlice.deck;

export const getKickedCards = (state: RootState): DeckCard[] => state.gameSlice.kickedCards;

export const getPlayerCards = (state: RootState): DeckCard[] => state.gameSlice.playerCards;

export const getTeammateCards = (state: RootState): DeckCard[] => state.gameSlice.teammateCards;

export const getDealer = (state: RootState): number | undefined => state.gameSlice.dealer;

export const getTurn = (state: RootState): number | undefined => state.gameSlice.turn;

export const getBeg = (state: RootState): BegResponseInput['response'] | undefined => state.gameSlice.beg;

export const getTeamScore = (state: RootState): number[] | undefined => state.gameSlice.teamScore;

export const getMessage = (state: RootState): ServerMessage | undefined => state.gameSlice.message;

export const getLift = (state: RootState): LiftCard[] => state.gameSlice.lift;

export const getGame = (state: RootState): number[] => state.gameSlice.game;

export const getRoundWinners = (state: RootState): RoundWinners | undefined => state.gameSlice.roundWinners;

export const getMatchWinner = (state: RootState): MatchWinner | undefined => state.gameSlice.matchWinner;

export const getLiftWinner = (state: RootState): number | undefined => state.gameSlice.liftWinner;

export const getGameStarted = (state: RootState): boolean => state.gameSlice.gameStarted;

export const getPlayerJoinedRoom = (state: RootState): boolean => state.gameSlice.playerJoinedRoom;

export const getActiveAbilities = (state: RootState): CardAbilities[] => state.gameSlice.activeAbilities;

export const getPlayerStatus = (state: RootState): PlayerStatus[] => state.gameSlice.playerStatus;

export const getTwosPlayed = (state: RootState): RoomSocket['twosPlayed'] => state.gameSlice.twosPlayed;

export const getRevealedBare = (state: RootState): boolean => state.gameSlice.revealedBare;

export const getDoubleLiftCards = (state: RootState): LiftCard[] => state.gameSlice.doubleLiftCards;

export const getDoubleLiftModalVisible = (state: RootState): boolean => state.gameSlice.doubleLiftModalVisible;

export const getGameIsTwo = (state: RootState): boolean => state.gameSlice.gameIsTwo;

export const getSettingsModalVisible = (state: RootState): boolean => state.gameSlice.settingsModalVisible;

export const getJoinRoomLoading = (state: RootState): boolean => state.gameSlice.joinRoomLoading;
