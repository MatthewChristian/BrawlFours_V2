import React, { useMemo, useState } from 'react';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import PlayingCard from './PlayingCard';
import { getKickedCards, getTeamScore, getGame, setSettingsModalVisible, setLeaveModalVisible } from '../../slices/game.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { socket } from '../SocketClient';
import Button from '../../core/components/Button';
import { IoExit, IoSettings } from 'react-icons/io5';
import ActiveAbilities from './ActiveAbilities';
import Image from 'next/image';
import logoSvg from '../../public/images/logo/logo.svg';
import LeaveConfirmModal from './Modals/LeaveConfirmModal';

interface Props {
  playerTeam?: number;
  socketData?: BasicRoomInput;
}

export default function MobileGameInfo({ playerTeam, socketData }: Props) {

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

  return (
    <div className='info-bg h-full flex flex-row items-center justify-between'>

      <div className='flex flex-col justify-start h-full py-3 gap-2 mx-2 w-1/3'>
        <div className='h-1/4 pl-2'>
          <Image priority
            src={logoSvg}
            width={200}
            alt="" />
        </div>

        <div className='flex flex-row gap-2 px-2'>
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

        <div className='font-bold text-sm text-white px-2'>
          <div>
            <p>Score <span className='text-blue-500'>{teamScoreOrdered[0]}</span> - <span className='text-red-500'>{teamScoreOrdered[1]}</span></p>
          </div>

          <div>
            <p>Game <span className='text-blue-500'>{gameOrdered[0]}</span> - <span className='text-red-500'>{gameOrdered[1]}</span></p>
          </div>
        </div>
      </div>

      <div className='w-1/3 flex flex-col gap-2'>
        <div className='w-32 px-2 flex flex-wrap justify-center items-center gap-2 h-3/4'>
          <ActiveAbilities />
        </div>
      </div>


      <div className='flex flex-row mx-2 w-1/3 items-center justify-start'>
        <div className='flex flex-row mx-5'>
          <PlayingCard cardData={kickedCards ? kickedCards[0] : undefined} className="kicked-1" style={{ marginRight: -55 }}></PlayingCard>
          <PlayingCard cardData={kickedCards ? kickedCards[1] : undefined} className="kicked-2" style={{ marginRight: -55 }}></PlayingCard>
          <PlayingCard cardData={kickedCards ? kickedCards[2] : undefined} className="kicked-3" style={{ marginRight: -55 }}></PlayingCard>
          <PlayingCard cardData={kickedCards ? kickedCards[3] : undefined} className="kicked-4" style={{ marginRight: -55 }}></PlayingCard>
        </div>
      </div>

      <LeaveConfirmModal socketData={socketData} />
    </div>
  );
}
