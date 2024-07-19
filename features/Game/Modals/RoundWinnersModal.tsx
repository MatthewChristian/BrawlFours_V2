import React from 'react';
import Modal from '../../../core/components/Modal';
import { RoundWinners } from '../../../models/RoundWinners';
import { PlayerSocket } from '../../../models/PlayerSocket';
import RoundWinnersModalContents from './RoundWinnersModalContents';

interface Props {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  roundWinners?: RoundWinners;
  players?: PlayerSocket[]
}

export default function RoundWinnersModal({ isVisible, setIsVisible, roundWinners, players }: Props) {

  return (
    <Modal open={isVisible} closeOnDocumentClick={true} onClose={() => setIsVisible(false)}>
      <RoundWinnersModalContents players={players} roundWinners={roundWinners} />
    </Modal>
  );
}
