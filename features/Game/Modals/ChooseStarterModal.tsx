import React from 'react';
import Modal from '../../../core/components/Modal';
import { useAppSelector } from '../../../store/hooks';
import { getIsChooseStarterModalVisible } from '../../../slices/modals.slice';
import Button from '../../../core/components/Button';
import { PlayerSocket } from '../../../models/PlayerSocket';

interface Props {
  handleChooseStarterConfirm: () => void;
  handleChooseStarterClose: () => void;
  player1Data?: PlayerSocket;
  player2Data?: PlayerSocket;
  player3Data?: PlayerSocket;
  player4Data?: PlayerSocket;
  selectedOpp?: PlayerSocket;
  setSelectedOpp: (val: PlayerSocket) => void;
}

export default function ChooseStarterModal({  handleChooseStarterClose, handleChooseStarterConfirm, player1Data, player2Data, player3Data, player4Data, selectedOpp, setSelectedOpp }: Props) {

  const isChooseStarterModalVisible = useAppSelector(getIsChooseStarterModalVisible);

  return (
    <Modal contentStyle={{ width: 'fit-content' }} open={isChooseStarterModalVisible} closeOnDocumentClick={false}>
      <div className="px-12 text-center">Choose who will play first next lift</div>

      <div className='flex flex-col gap-5 justify-center items-center mt-3 mx-5'>
        <Button className={(selectedOpp?.id == player1Data?.id ? 'blue-button' : 'white-button') + ' w-full justify-center'} onClick={() => setSelectedOpp(player1Data)}>
          {player1Data.nickname}
        </Button>

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
        <Button disabled={!selectedOpp} className='green-button mt-5' onClick={() => { handleChooseStarterConfirm(); }}>
          Confirm
        </Button>

        <Button className='red-button mt-5' onClick={() => { handleChooseStarterClose(); }}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
