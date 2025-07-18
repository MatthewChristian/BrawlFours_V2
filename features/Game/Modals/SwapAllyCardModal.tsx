import React from 'react';
import Modal from '../../../core/components/Modal';
import { useAppSelector } from '../../../store/hooks';
import { getIsAllySelectionModalVisible } from '../../../slices/modals.slice';
import Button from '../../../core/components/Button';
import PlayingCard from '../PlayingCard';
import { getMobileView } from '../../../slices/game.slice';
import { DeckCard } from '../../../models/DeckCard';
import { IoMdSwap } from 'react-icons/io';

interface Props {
  selectedCard?: DeckCard;
  handleAllySelectionConfirm: () => void;
  handleAllySelectionClose: () => void;
  selectedAllyCard: DeckCard;
}

export default function SwapAllyCardModal({ selectedAllyCard, selectedCard, handleAllySelectionClose, handleAllySelectionConfirm }: Props) {

  const mobileView = useAppSelector(getMobileView);

  const isAllySelectionModalVisible = useAppSelector(getIsAllySelectionModalVisible);

  return (
    <Modal contentStyle={{ width: 'fit-content' }} open={isAllySelectionModalVisible && !mobileView} closeOnDocumentClick={false}>

      <div className='px-5'>
        <div className='flex flex-row justify-center items-center mt-3 gap-5'>
          <PlayingCard
            key={'swap-card-1'}
            cardData={selectedCard}
            isDeckCard={false}
            isOutline={!selectedCard}
            isNotPlayable
          />

          <IoMdSwap size={32}/>

          <PlayingCard
            key={'swap-card-2'}
            cardData={selectedAllyCard}
            isDeckCard={false}
            isOutline={!selectedAllyCard}
            isNotPlayable
          />
        </div>


        <div className='mt-3 text-bold text-center text-lg text-blue-500'>Swapping these two cards</div>

      </div>


      <div className='flex flex-row gap-5 justify-center'>
        <Button disabled={!(selectedCard && selectedAllyCard)} className='green-button mt-5' onClick={() => { handleAllySelectionConfirm(); }}>
            Confirm
        </Button>

        <Button className='red-button mt-5' onClick={() => { handleAllySelectionClose(); }}>
            Cancel
        </Button>
      </div>
    </Modal>
  );
}
