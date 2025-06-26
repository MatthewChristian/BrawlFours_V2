import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getAllyCardsViewExpanded, setAllyCardsViewExpanded } from '../../../slices/game.slice';
import Button from '../../../core/components/Button';
import { IoEye } from 'react-icons/io5';
import { socket } from '../../SocketClient';
import { PlayerSocket } from '../../../models/PlayerSocket';
import { BasicRoomInput } from '../../../models/BasicRoomInput';
import { motion } from 'framer-motion';

interface Props {
  socketData?: BasicRoomInput;
  disabled?: boolean;
}

export default function AllyCardsModal({ socketData, disabled }: Props) {

  const dispatch = useAppDispatch();

  const isExpanded = useAppSelector(getAllyCardsViewExpanded);

  return (
    <motion.div
      animate={{
        height: isExpanded ? '20vh' : undefined,
      }}>
      <Button
        disabled={disabled}
        className='blue-button'
        iconClassName='relative'
        icon={<IoEye size={20} />}
        onClick={() => dispatch(setAllyCardsViewExpanded(true))}
      />
    </motion.div>
  );
}
