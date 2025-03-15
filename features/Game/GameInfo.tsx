import React, { useMemo } from 'react';
import PlayingCard from './PlayingCard';
import { useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getGame, getKickedCards, getTeamScore } from '../../slices/game.slice';
import Chatbox from './Chatbox';
import { BasicRoomInput } from '../../models/BasicRoomInput';

interface Props {
  playerTeam?: number;
  socketData?: BasicRoomInput;
}

export default function GameInfo({ playerTeam, socketData } : Props) {


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
    <div className="bg-red-100 p-2 h-screen w-1/5 z-[9999] min-w-min">

      <div className='h-[30vh]'>
        <div className='flex flex-row'>
          <PlayingCard isDeckCard className="deck"></PlayingCard>
          <div className='flex flex-row'>
            <PlayingCard cardData={kickedCards ? kickedCards[0] : undefined} className="kicked-1" style={{ marginRight: -60 }}></PlayingCard>
            <PlayingCard cardData={kickedCards ? kickedCards[1] : undefined} className="kicked-2" style={{ marginRight: -60 }}></PlayingCard>
            <PlayingCard cardData={kickedCards ? kickedCards[2] : undefined} className="kicked-3" style={{ marginRight: -60 }}></PlayingCard>
            <PlayingCard cardData={kickedCards ? kickedCards[3] : undefined} className="kicked-4" style={{ marginRight: -60 }}></PlayingCard>
          </div>
        </div>

        <div>
          <p>Score: {teamScoreOrdered[0]} - {teamScoreOrdered[1]}</p>
        </div>

        <div>
          <p>Game: {gameOrdered[0]} - {gameOrdered[1]}</p>
        </div>
      </div>

      <Chatbox socketData={socketData} className='h-[68vh]'/>

    </div>
  );
}
