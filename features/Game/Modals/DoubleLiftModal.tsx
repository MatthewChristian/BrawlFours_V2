import React, { useMemo } from 'react';
import Modal from '../../../core/components/Modal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Button from '../../../core/components/Button';
import PlayingCard from '../PlayingCard';
import { getDoubleLiftCards, getDoubleLiftModalVisible, getMobileView, setDoubleLiftModalVisible } from '../../../slices/game.slice';

export default function DoubleLiftModal() {

  const dispatch = useAppDispatch();

  const mobileView = useAppSelector(getMobileView);

  const doubleLiftCards = useAppSelector(getDoubleLiftCards);

  const doubleLiftModalVisible = useAppSelector(getDoubleLiftModalVisible);

  const doubleLiftCardElements = useMemo(() => {
    return (<div className='grid grid-cols-4 gap-5 justify-center items-center mt-3 mx-5'>
      {
        doubleLiftCards?.map((card, k) => (
          <PlayingCard
            key={'dl' + k}
            cardData={card}
            isNotPlayable
            glow='none'
          />
        ))
      }
    </div>);
  }, [doubleLiftCards]);


  function handleCloseModal() {
    dispatch(setDoubleLiftModalVisible(false));
  }


  return (
    <Modal contentStyle={{ width: mobileView ? '90vw' : 'fit-content' }} open={doubleLiftModalVisible} onClose={handleCloseModal} closeOnDocumentClick={true}>
      <div className="px-12 text-center">Cards that the winner of this lift will also win</div>

      {doubleLiftCardElements}

      <div className='flex flex-row gap-5 justify-center'>
        <Button className='red-button mt-5' onClick={handleCloseModal}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
