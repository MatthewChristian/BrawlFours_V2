import React from 'react';
import Modal from '../../../core/components/Modal';
import Button from '../../../core/components/Button';
import { DeckCard } from '../../../models/DeckCard';

interface Props {
  setIsTargettingOppLift: (val: boolean) => void;
  setPlayedCard: (val: DeckCard) => void;
  isTargettingOppLift: boolean;
}

export default function OppReplayModal({ setIsTargettingOppLift, setPlayedCard, isTargettingOppLift }: Props) {

  return (
    <Modal className='top-modal' contentStyle={{ width: 'fit-content' }} open={isTargettingOppLift} closeOnDocumentClick={false}>
      <div className="px-12 text-center">Choose a card in the lift for the opponent to take back</div>
      <div className='flex flex-row justify-center'>
        <Button className='red-button mt-5' onClick={() => { setIsTargettingOppLift(false); setPlayedCard(undefined); }}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
