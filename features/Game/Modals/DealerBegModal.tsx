import React from 'react';
import Button from '../../../core/components/Button';
import Modal from '../../../core/components/Modal';
import { socket } from '../../SocketClient';
import { BasicRoomInput } from '../../../models/BasicRoomInput';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getIsBegResponseModalVisible, setIsBegResponseModalVisible } from '../../../slices/modals.slice';
import { PlayerSocket } from '../../../models/PlayerSocket';

interface Props {
  socketData?: BasicRoomInput;
  isForceStandCardInHand: boolean;
  turnPlayerData?: PlayerSocket;
}

export default function DealerBegModal({ socketData, isForceStandCardInHand, turnPlayerData }: Props) {

  const dispatch = useAppDispatch();

  const isBegResponseModalVisible = useAppSelector(getIsBegResponseModalVisible);

  return (
    <Modal open={isBegResponseModalVisible} closeOnDocumentClick={false} onClose={() => dispatch(setIsBegResponseModalVisible(false))} contentStyle={isForceStandCardInHand ? { width: '30em' } : undefined}>
      <div className="flex flex-col justify-center items-center mx-5">
        <div className="text-center">{turnPlayerData?.nickname} has begged!</div>
        <div className='w-full flex flex-row justify-center gap-5'>
          <Button className='blue-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'give' })}>
            {
              isForceStandCardInHand ? 'Force stand' : 'Give one'
            }

          </Button>

          <Button className='green-button mt-5' onClick={() => socket?.emit('begResponse', { ...socketData, response: 'run' })}>
            Run pack
          </Button>
        </div>
        {
          isForceStandCardInHand ? <div className='text-gray-500 mt-3 text-sm italic text-center'>You have a card in your hand that allows you to force your opponent to stand without giving them a point</div> : undefined
        }

      </div>
    </Modal>
  );
}
