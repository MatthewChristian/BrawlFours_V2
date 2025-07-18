import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';

/**
 * State Definition
 */
interface ModalsSlice {
  isBegModalVisible: boolean,
  isRoundWinnersModalVisible: boolean,
  isBegResponseModalVisible: boolean,
  isWaitingBegResponseModalVisible: boolean,
  isRedealModalVisible: boolean,
  isOppSelectionModalVisible: boolean,
  isAllySelectionModalVisible: boolean,
  isChooseStarterModalVisible: boolean,
  isSwapHandsModalVisible: boolean,
}
const initialState: ModalsSlice = {
  isBegModalVisible: false,
  isRoundWinnersModalVisible: false,
  isBegResponseModalVisible: false,
  isWaitingBegResponseModalVisible: false,
  isRedealModalVisible: false,
  isOppSelectionModalVisible: false,
  isAllySelectionModalVisible: false,
  isChooseStarterModalVisible: false,
  isSwapHandsModalVisible: false,
};

/**
 * Reducers & Actions Definitions
 */
export const modalsSlice = createSlice({
  name: 'modalsSlice',
  initialState,
  reducers: {

    setIsBegModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isBegModalVisible = action.payload;
    },

    setIsRoundWinnersModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isRoundWinnersModalVisible = action.payload;
    },

    setIsBegResponseModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isBegResponseModalVisible = action.payload;
    },

    setIsWaitingBegResponseModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isWaitingBegResponseModalVisible = action.payload;
    },

    setIsRedealModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isRedealModalVisible = action.payload;
    },

    setIsOppSelectionModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isOppSelectionModalVisible = action.payload;
    },

    setIsAllySelectionModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isAllySelectionModalVisible = action.payload;
    },

    setIsChooseStarterModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isChooseStarterModalVisible = action.payload;
    },

    setIsSwapHandsModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isSwapHandsModalVisible = action.payload;
    },

  }
});

/**
 * Exports
 */
// Reducer
export default modalsSlice.reducer;
// Actions
export const {
  setIsBegModalVisible,
  setIsRoundWinnersModalVisible,
  setIsBegResponseModalVisible,
  setIsWaitingBegResponseModalVisible,
  setIsRedealModalVisible,
  setIsOppSelectionModalVisible,
  setIsAllySelectionModalVisible,
  setIsChooseStarterModalVisible,
  setIsSwapHandsModalVisible,
} = modalsSlice.actions;

// Selectors

export const getIsBegModalVisible = (state: RootState): boolean => state.modalsSlice.isBegModalVisible;
export const getIsRoundWinnersModalVisible = (state: RootState): boolean => state.modalsSlice.isRoundWinnersModalVisible;
export const getIsBegResponseModalVisible = (state: RootState): boolean => state.modalsSlice.isBegResponseModalVisible;
export const getIsWaitingBegResponseModalVisible = (state: RootState): boolean => state.modalsSlice.isWaitingBegResponseModalVisible;
export const getIsRedealModalVisible = (state: RootState): boolean => state.modalsSlice.isRedealModalVisible;
export const getIsOppSelectionModalVisible = (state: RootState): boolean => state.modalsSlice.isOppSelectionModalVisible;
export const getIsAllySelectionModalVisible = (state: RootState): boolean => state.modalsSlice.isAllySelectionModalVisible;
export const getIsChooseStarterModalVisible = (state: RootState): boolean => state.modalsSlice.isChooseStarterModalVisible;
export const getIsSwapHandsModalVisible = (state: RootState): boolean => state.modalsSlice.isSwapHandsModalVisible;
