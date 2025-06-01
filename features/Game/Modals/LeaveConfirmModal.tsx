import React from 'react';
import Popup from 'reactjs-popup';
import Button from '../../../core/components/Button';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getLeaveModalVisible, setLeaveModalVisible } from '../../../slices/game.slice';
import { BasicRoomInput } from '../../../models/BasicRoomInput';
import { socket } from '../../SocketClient';
import Modal from '../../../core/components/Modal';

interface Props {
  socketData?: BasicRoomInput;
}

export default function LeaveConfirmModal({ socketData }: Props) {

  const dispatch = useAppDispatch();

  const leaveModalOpen = useAppSelector(getLeaveModalVisible);

  function leaveRoom() {
    const data: BasicRoomInput = {
      ...socketData
    };

    socket.emit('leaveRoom', data);
  }


  return (
    <Modal open={leaveModalOpen} closeOnDocumentClick={true} onClose={() => dispatch(setLeaveModalVisible(false))} centered>
      <div className="flex flex-col justify-center items-center">
        <div className="">Are you sure you want to leave this room?</div>

        <div className='flex flex-row gap-5'>
          <Button className='blue-button mt-5' onClick={() => leaveRoom()}>
            Yes
          </Button>

          <Button className='red-button mt-5' onClick={() => dispatch(setLeaveModalVisible(false))}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
}
