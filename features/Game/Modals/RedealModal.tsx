import React from 'react';
import Modal from '../../../core/components/Modal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getIsRedealModalVisible, setIsRedealModalVisible } from '../../../slices/modals.slice';
import Button from '../../../core/components/Button';
import { socket } from '../../SocketClient';
import { BasicRoomInput } from '../../../models/BasicRoomInput';

interface Props {
  socketData?: BasicRoomInput;
}

export default function RedealModal({ socketData }: Props) {

  const dispatch = useAppDispatch();

  const isRedealModalVisible = useAppSelector(getIsRedealModalVisible);

  return (
    <Modal open={isRedealModalVisible} closeOnDocumentClick={false} onClose={() => dispatch(setIsRedealModalVisible(false))}>
      <div className="flex flex-col justify-center items-center mx-5">
        <div className="text-center">The deck has run out of cards and must be redealt!</div>
        <div className='w-full flex flex-row justify-center gap-5'>
          <Button className='blue-button mt-5' onClick={() => socket?.emit('redeal', socketData)}>
            Redeal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
