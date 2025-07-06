import React, { RefObject, useMemo } from 'react';
import PlayingCard from './PlayingCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getGame, getKickedCards, getTeamScore, setLeaveModalVisible, setSettingsModalVisible } from '../../slices/game.slice';
import Chatbox from './Chatbox';
import { BasicRoomInput } from '../../models/BasicRoomInput';
import Button from '../../core/components/Button';
import { IoExit, IoSettings } from 'react-icons/io5';
import Image from 'next/image';
import logoSvg from '../../public/images/logo/logo.svg';
import { FaCrown } from 'react-icons/fa';
import { CgCardDiamonds } from 'react-icons/cg';
import { TooltipRefProps } from 'react-tooltip';

interface Props {
  playerTeam?: number;
  socketData?: BasicRoomInput;
  settingsTooltipRef: RefObject<TooltipRefProps>;
  leaveTooltipRef: RefObject<TooltipRefProps>;
}

export default function GameInfo({ playerTeam, socketData, settingsTooltipRef, leaveTooltipRef } : Props) {

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
              externalTooltipRef={leaveTooltipRef}
              onClick={() => dispatch(setLeaveModalVisible(true))}
              tooltipClassname='border border-white'
              tooltipArrowClassname='border border-white border-t-0 border-l-0'
            />

            <Button
              className='blue-button'
              iconClassName='relative '
              icon={<IoSettings size={20} />}
              tooltip='Settings'
              tooltipAnchor='settings'
              tooltipPlacement='bottom'
              externalTooltipRef={settingsTooltipRef}
              onClick={() => dispatch(setSettingsModalVisible(true))}
              tooltipClassname='border border-white'
              tooltipArrowClassname='border border-white border-t-0 border-l-0'
            />
          </div>
        </div>

        <div className='flex flex-row'>
          <PlayingCard isDeckCard className="deck"></PlayingCard>
          <div className='flex flex-row'>
            <PlayingCard cardData={kickedCards ? kickedCards[0] : undefined} className='mr-[-60px]'></PlayingCard>
            {
              kickedCards && kickedCards[1] &&
                <PlayingCard cardData={kickedCards[1]} className='mr-[-60px]'></PlayingCard>
            }
            {
              kickedCards && kickedCards[2] &&
              <PlayingCard cardData={kickedCards[2]} className='mr-[-60px]'></PlayingCard>
            }
            {
              kickedCards && kickedCards[3] &&
              <PlayingCard cardData={kickedCards[3]} className='mr-[-60px]'></PlayingCard>
            }
          </div>
        </div>

        <div className='mt-2 pt-2 mx-2 font-bold text-white'>
          <div className='flex flex-row items-center gap-2 mb-1'>
            <div className='relative bottom-[2px]'>
              <FaCrown color='white' size={20} />
            </div>
            <div>
              <div className='flex flex-row'>
                <div className='w-16'>Score</div>
                <div>
                  <span className='text-blue-500'>{teamScoreOrdered[0]}</span> - <span className='text-red-500'>{teamScoreOrdered[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className='flex flex-row items-center gap-2'>
              <div className='relative bottom-[2px]'>
                <CgCardDiamonds color='white' size={20}/>
              </div>
              <div>
                <div className='flex flex-row'>
                  <div className='w-16'>Game</div>
                  <div>
                    <span className='text-blue-500'>{gameOrdered[0]}</span> - <span className='text-red-500'>{gameOrdered[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Chatbox socketData={socketData} className='h-[68vh]'/>

    </div>
  );
}
