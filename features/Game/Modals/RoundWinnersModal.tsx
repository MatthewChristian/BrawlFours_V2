import React from 'react';
import Modal from '../../../core/components/Modal';
import { RoundWinners } from '../../../models/RoundWinners';
import { PlayerSocket } from '../../../models/PlayerSocket';
import RoundWinnersModalContents from './RoundWinnersModalContents';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getIsRoundWinnersModalVisible, setIsRoundWinnersModalVisible } from '../../../slices/modals.slice';

interface Props {
  roundWinners?: RoundWinners;
  players?: PlayerSocket[];
  isMatchWinnersModalVisible?: boolean;
}

export default function RoundWinnersModal({ roundWinners, players, isMatchWinnersModalVisible }: Props) {

  const dispatch = useAppDispatch();

  const isVisible = useAppSelector(getIsRoundWinnersModalVisible);

  return (
    <Modal open={isVisible && !isMatchWinnersModalVisible} closeOnDocumentClick={true} onClose={() => dispatch(setIsRoundWinnersModalVisible(false))}>
      <RoundWinnersModalContents players={players} roundWinners={roundWinners} />
    </Modal>
  );
}
