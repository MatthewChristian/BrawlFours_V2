import React, { useMemo } from 'react';
import Modal from '../../../core/components/Modal';
import { useAppSelector } from '../../../store/hooks';
import { getIsAllySelectionModalVisible } from '../../../slices/modals.slice';
import Button from '../../../core/components/Button';
import PlayingCard from '../PlayingCard';
import { getMobileView } from '../../../slices/game.slice';
import { DeckCard } from '../../../models/DeckCard';
import { IoMdSwap } from 'react-icons/io';
import { PlayerSocket } from '../../../models/PlayerSocket';

interface Props {
  selectedCard?: DeckCard;
  handleAllySelectionConfirm: () => void;
  handleAllySelectionClose: () => void;
  selectedAllyCard: DeckCard;
  handleSelectAllyCard: (val: DeckCard) => void;
  handleSelectCard: (val: DeckCard) => void;
  player3Data?: PlayerSocket;
  player3Cards?: DeckCard[];
  player1Cards?: DeckCard[];
  playedCard?: DeckCard;
}

export default function SwapAllyCardMobileModal({ selectedAllyCard, selectedCard, handleAllySelectionClose, handleAllySelectionConfirm, playedCard, player1Cards, player3Cards, player3Data, handleSelectAllyCard, handleSelectCard }: Props) {

  const mobileView = useAppSelector(getMobileView);

  const isAllySelectionModalVisible = useAppSelector(getIsAllySelectionModalVisible);

  const player3CardElements = useMemo(() => {
    return (<div className='flex flex-row justify-center'>
      {
        player3Cards.map((card, k) => {
          console.log('Rerender sacm');
          return (
            <PlayingCard
              key={'3_swap_' + k}
              player={3}
              cardData={card}
              className='-mx-2 p-0'
              onClickHandler={() => player3Cards.length == 0 ? undefined : handleSelectAllyCard(card)}
              glow={'blue'}
              ignoreMobileClick
            />
          );
        })
      }
    </div>);
  }, [player3Cards]);


  const player1CardElements = useMemo(() => {
    return (<div className='flex flex-row justify-center'>
      {
        player1Cards.filter(card => !(card.suit == playedCard?.suit && card.value == playedCard?.value)).map((card, k) => {

          return (
            <PlayingCard
              key={'1_swap_' + k}
              player={1}
              cardData={card}
              isDeckCard={player1Cards.length == 0 ? true : false}
              onClickHandler={() => player1Cards.length == 0 ? undefined : handleSelectCard(card)}
              ignoreMobileClick
              className='-mx-2'
              glow='blue'
            />
          );
        }
        )
      }
    </div>);
  }, [player1Cards, playedCard]);



  return (
    !mobileView ? <></> :
      <Modal contentStyle={{ width: '90vw', height: '80%' }} open={isAllySelectionModalVisible} closeOnDocumentClick={false}>

        <div className='px-5 flex flex-col justify-center items-center gap-5 h-full'>

          <div>
            {player3CardElements}

            <div className='text-center font-bold mt-2'>{player3Data?.nickname}&apos;s hand</div>
          </div>

          <div className='flex flex-row justify-center items-center mt-3 gap-5'>
            <PlayingCard
              key={'swap-card-1'}
              cardData={selectedCard}
              isDeckCard={false}
              isOutline={!selectedCard}
              isNotPlayable
            />

            <IoMdSwap size={32} />

            <PlayingCard
              key={'swap-card-2'}
              cardData={selectedAllyCard}
              isDeckCard={false}
              isOutline={!selectedAllyCard}
              isNotPlayable
            />

          </div>

          <div className='text-bold text-center text-lg text-blue-500'>Swapping these two cards</div>

          <div className='mt-5'>
            {player1CardElements}

            <div className='text-center font-bold mt-2'>Your hand</div>
          </div>



          <div className='flex flex-row gap-5 justify-center'>
            <Button disabled={!(selectedCard && selectedAllyCard)} className='green-button' onClick={handleAllySelectionConfirm}>
            Confirm
            </Button>

            <Button className='red-button' onClick={handleAllySelectionClose}>
            Cancel
            </Button>
          </div>

        </div>



      </Modal>
  );
}
