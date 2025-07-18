import React from 'react';
import Button from '../../../core/components/Button';
import Modal from '../../../core/components/Modal';
import { socket } from '../../SocketClient';
import { BasicRoomInput } from '../../../models/BasicRoomInput';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getIsBegModalVisible, getIsRoundWinnersModalVisible, setIsBegModalVisible } from '../../../slices/modals.slice';

interface Props {
  socketData?: BasicRoomInput;
}

export default function BeggarBegModal({ socketData }: Props) {

  const dispatch = useAppDispatch();

  const isBegModalVisible = useAppSelector(getIsBegModalVisible);
  const isRoundWinnersModalVisible = useAppSelector(getIsRoundWinnersModalVisible);

  return (
    <Modal open={isBegModalVisible && !isRoundWinnersModalVisible} closeOnDocumentClick={false} onClose={() => dispatch(setIsBegModalVisible(false))}>
      <div className="flex flex-col justify-center items-center mx-5">
        <div className="text-center">Do you want to beg or stand?</div>
        <div className='w-full flex flex-row justify-center gap-5'>
          <Button className='blue-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'begged' })}>
            Beg
          </Button>

          <Button className='green-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'stand' })}>
            Stand
          </Button>
        </div>
      </div>
    </Modal>
  );
}
