import React from 'react';
import Modal from '../../../core/components/Modal';
import Button from '../../../core/components/Button';
import { DeckCard } from '../../../models/DeckCard';

interface Props {
  setIsTargettingLift: (val: boolean) => void;
  setPlayedCard: (val: DeckCard) => void;
  isTargettingLift: boolean;
}

export default function TargetPowerlessModal({ setIsTargettingLift, setPlayedCard, isTargettingLift }: Props) {

  return (
    <Modal className='top-modal' contentStyle={{ width: 'fit-content' }} open={isTargettingLift} closeOnDocumentClick={false}>
      <div className="px-12 text-center">Choose a card in the lift to be powerless and worth 0 points</div>
      <div className='flex flex-row justify-center'>
        <Button className='red-button mt-5' onClick={() => { setIsTargettingLift(false); setPlayedCard(undefined); } }>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
