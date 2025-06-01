import React, { useMemo, useState } from 'react';
import PlayingCard from './PlayingCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getGame, getKickedCards, getTeamScore, setLeaveModalVisible, setSettingsModalVisible } from '../../slices/game.slice';
import Chatbox from './Chatbox';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import Button from '../../core/components/Button';
import { IoExit, IoSettings } from 'react-icons/io5';
import { socket } from '../SocketClient';
import Popup from 'reactjs-popup';
import SettingsModal from './Modals/SettingsModal';
import Image from 'next/image';
import logoSvg from '../../public/images/logo/logo.svg';
import LeaveConfirmModal from './Modals/LeaveConfirmModal';

interface Props {
  playerTeam?: number;
  socketData?: BasicRoomInput;
}

export default function GameInfo({ playerTeam, socketData } : Props) {

  const dispatch = useAppDispatch();

  const kickedCards = useAppSelector(getKickedCards);

  const teamScore = useAppSelector(getTeamScore);

  const game = useAppSelector(getGame);

  const teamScoreOrdered = useMemo(() => {
    return orderScore(teamScore);
  }, [teamScore, playerTeam]);

  const gameOrdered = useMemo(() => {
    return orderScore(game);
  }, [game, playerTeam]);


  function orderScore(score?: number[]) {
    if (!score) {
      return [0, 0];
    }

    if (playerTeam == 1 || playerTeam == 3) {
      return score;
    }
    else {
      return [...score].reverse();
    }
  }

  function leaveRoom() {
    const data: BasicRoomInput = {
      ...socketData
    };

    socket.emit('leaveRoom', data);
  }


  return (
    <div className={'info-bg p-2 h-screen z-[9999] min-w-min'}>

      <div className='h-[30vh]'>

        <div className='flex flex-row justify-between mb-2'>
          <div className='flex justify-center items-center'>
            <Image priority
              src={logoSvg}
              width={200}
              alt="" />
          </div>

          <div className='flex flex-row gap-2'>
            <Button
              className='red-button'
              iconClassName='relative '
              icon={<IoExit size={20} />}
              tooltip='Leave Room'
              tooltipAnchor='leave'
              onClick={() => dispatch(setLeaveModalVisible(true))}
            />

            <Button
              className='blue-button'
              iconClassName='relative '
              icon={<IoSettings size={20} />}
              tooltip='Settings'
              tooltipAnchor='settings'
              tooltipPlacement='bottom'
              onClick={() => dispatch(setSettingsModalVisible(true))}
            />
          </div>
        </div>

        <div className='flex flex-row'>
          <PlayingCard isDeckCard className="deck"></PlayingCard>
          <div className='flex flex-row'>
            <PlayingCard cardData={kickedCards ? kickedCards[0] : undefined} className="kicked-1" style={{ marginRight: -60 }}></PlayingCard>
            <PlayingCard cardData={kickedCards ? kickedCards[1] : undefined} className="kicked-2" style={{ marginRight: -60 }}></PlayingCard>
            <PlayingCard cardData={kickedCards ? kickedCards[2] : undefined} className="kicked-3" style={{ marginRight: -60 }}></PlayingCard>
            <PlayingCard cardData={kickedCards ? kickedCards[3] : undefined} className="kicked-4" style={{ marginRight: -60 }}></PlayingCard>
          </div>
        </div>

        <div className='mt-2 pt-2 mx-2 font-bold text-white'>
          <div>
            <p>Score <span className='text-blue-500'>{teamScoreOrdered[0]}</span> - <span className='text-red-500'>{teamScoreOrdered[1]}</span></p>
          </div>

          <div>
            <p>Game <span className='text-blue-500'>{gameOrdered[0]}</span> - <span className='text-red-500'>{gameOrdered[1]}</span></p>
          </div>
        </div>
      </div>

      <Chatbox socketData={socketData} className='h-[68vh]'/>

      <SettingsModal roomId={socketData.roomId} />

      <LeaveConfirmModal socketData={socketData} />

    </div>
  );
}
