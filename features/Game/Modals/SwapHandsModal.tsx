import React from 'react';
import Modal from '../../../core/components/Modal';
import { useAppSelector } from '../../../store/hooks';
import { getIsSwapHandsModalVisible } from '../../../slices/modals.slice';
import Button from '../../../core/components/Button';
import { PlayerSocket } from '../../../models/PlayerSocket';

interface Props {
  handleSwapHandsConfirm: () => void;
  handleSwapHandsClose: () => void;
  player2Data?: PlayerSocket;
  player3Data?: PlayerSocket;
  player4Data?: PlayerSocket;
  selectedOpp?: PlayerSocket;
  setSelectedOpp: (val: PlayerSocket) => void;
}

export default function SwapHandsModal({   player2Data, player3Data, player4Data, selectedOpp, setSelectedOpp, handleSwapHandsClose, handleSwapHandsConfirm }: Props) {

  const isSwapHandsModalVisible = useAppSelector(getIsSwapHandsModalVisible);

  return (
    <Modal contentStyle={{ width: 'fit-content' }} open={isSwapHandsModalVisible} closeOnDocumentClick={false}>
      <div className="px-12 text-center">Choose the player you want to swap hands with</div>

      <div className='flex flex-col gap-5 justify-center items-center mt-3 mx-5'>

        <Button className={(selectedOpp?.id == player2Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player2Data)}>
          {player2Data.nickname}
        </Button>

        <Button className={(selectedOpp?.id == player3Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player3Data)}>
          {player3Data.nickname}
        </Button>

        <Button className={(selectedOpp?.id == player4Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player4Data)}>
          {player4Data.nickname}
        </Button>

      </div>

      <div className='flex flex-row gap-5 justify-center'>
        <Button disabled={!selectedOpp} className='green-button mt-5' onClick={handleSwapHandsConfirm}>
          Confirm
        </Button>

        <Button className='red-button mt-5' onClick={handleSwapHandsClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
