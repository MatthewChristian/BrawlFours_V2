import React from 'react';
import Modal from '../../../core/components/Modal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getIsWaitingBegResponseModalVisible, setIsWaitingBegResponseModalVisible } from '../../../slices/modals.slice';
import { PlayerSocket } from '../../../models/PlayerSocket';

interface Props {
  dealerData?: PlayerSocket;
}

export default function WaitingBegModal({ dealerData }: Props) {

  const dispatch = useAppDispatch();

  const isWaitingBegResponseModalVisible = useAppSelector(getIsWaitingBegResponseModalVisible);

  return (
    <Modal open={isWaitingBegResponseModalVisible} closeOnDocumentClick={false} onClose={() => dispatch(setIsWaitingBegResponseModalVisible(false))}>
      <div className="flex flex-col justify-center items-center mx-5">
        <div className="text-center">Waiting for response from {dealerData?.nickname}...</div>
      </div>
    </Modal>
  );
}
