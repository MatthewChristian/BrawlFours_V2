import React from 'react';
import Modal from '../../../core/components/Modal';
import { useAppSelector } from '../../../store/hooks';
import { getIsOppSelectionModalVisible } from '../../../slices/modals.slice';
import { PlayerSocket } from '../../../models/PlayerSocket';
import Button from '../../../core/components/Button';
import PlayingCard from '../PlayingCard';
import { getMobileView } from '../../../slices/game.slice';
import { DeckCard } from '../../../models/DeckCard';

interface Props {
  player2Data?: PlayerSocket;
  player4Data?: PlayerSocket;
  selectedOpp?: PlayerSocket;
  selectedCard?: DeckCard;
  handleOppSelectionConfirm: () => void;
  handleOppSelectionClose: () => void;
  setSelectedOpp: (val: PlayerSocket) => void;
}

export default function SwapOppCardModal({ player2Data, player4Data, selectedOpp, selectedCard, handleOppSelectionClose, handleOppSelectionConfirm, setSelectedOpp }: Props) {

  const mobileView = useAppSelector(getMobileView);

  const isOppSelectionModalVisible = useAppSelector(getIsOppSelectionModalVisible);

  return (
    <Modal contentStyle={{ width: mobileView ? '80vw' : 'fit-content' }} open={isOppSelectionModalVisible} closeOnDocumentClick={false}>
      <div className="px-12 text-center">Choose a card an an opponent to swap the card with</div>

      <div className='flex flex-col gap-5 justify-center items-center mt-3 w-full px-5'>
        { player2Data.numCards != 0 &&
            <Button className={(selectedOpp?.id == player2Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center' } onClick={() => setSelectedOpp(player2Data)}>
              {player2Data.nickname}
            </Button>
        }

        { player4Data.numCards != 0 &&
            <Button className={(selectedOpp?.id == player4Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player4Data)}>
              {player4Data.nickname}
            </Button>
        }
      </div>

      { selectedCard &&
        <div>
          <div className='flex flex-row justify-center mt-3'>
            <PlayingCard
              key={'swap-card'}
              cardData={selectedCard}
              isDeckCard={false}
              isNotPlayable
            />
          </div>

          { selectedOpp &&
            <div className='mt-3 text-bold text-center text-lg text-blue-500'>Swapping this card with a random card from {selectedOpp.nickname}&apos;s hand</div>
          }
        </div>
      }

      <div className='flex flex-row gap-5 justify-center'>
        <Button disabled={!(selectedCard && selectedOpp)} className='green-button mt-5' onClick={() => { handleOppSelectionConfirm(); }}>
          Confirm
        </Button>

        <Button className='red-button mt-5' onClick={() => { handleOppSelectionClose(); }}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
