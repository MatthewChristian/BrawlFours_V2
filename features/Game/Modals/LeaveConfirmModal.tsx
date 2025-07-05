import React, { RefObject } from 'react';
import Button from '../../../core/components/Button';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getLeaveModalVisible, setLeaveModalVisible } from '../../../slices/game.slice';
import { BasicRoomInput } from '../../../models/BasicRoomInput';
import { socket } from '../../SocketClient';
import Modal from '../../../core/components/Modal';
import { TooltipRefProps } from 'react-tooltip';

interface Props {
  socketData?: BasicRoomInput;
  leaveTooltipRef: RefObject<TooltipRefProps>;
}

export default function LeaveConfirmModal({ socketData, leaveTooltipRef }: Props) {

  const dispatch = useAppDispatch();

  const leaveModalOpen = useAppSelector(getLeaveModalVisible);

  function leaveRoom() {
    const data: BasicRoomInput = {
      ...socketData
    };

    socket.emit('leaveRoom', data);
    handleCancel();
  }

  function handleCancel() {
    dispatch(setLeaveModalVisible(false));
    leaveTooltipRef.current?.close();
  }

  return (
    <Modal open={leaveModalOpen} closeOnDocumentClick={true} onClose={handleCancel} centered>
      <div className="flex flex-col justify-center items-center">
        <div className="text-center">Are you sure you want to leave this room?</div>

        <div className='flex flex-row gap-5'>
          <Button className='blue-button mt-5' onClick={() => leaveRoom()}>
            Yes
          </Button>

          <Button className='red-button mt-5' onClick={handleCancel}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
}
