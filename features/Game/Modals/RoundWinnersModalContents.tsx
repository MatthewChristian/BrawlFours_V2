import React from 'react';
import PlayingCard from '../PlayingCard';
import { PlayerSocket } from '../../../models/PlayerSocket';
import { RoundWinners } from '../../../models/RoundWinners';

interface Props {
  roundWinners?: RoundWinners;
  players?: PlayerSocket[];
  gameWinnerNames?: string;
}


export default function RoundWinnersModalContents({ roundWinners, players, gameWinnerNames }: Props) {

  function formatGameScore(score?: number[]) {
    if (!score) {
      return undefined;
    }

    const playersInTeam1: string[] = [];
    const playersInTeam2: string[] = [];

    players?.forEach((el) => {
      if (el.team == 1) {
        playersInTeam1.push(el.nickname ?? '');
      }
      else {
        playersInTeam2.push(el.nickname ?? '');
      }
    });

    const t1Names = gameWinnerNames ? gameWinnerNames : playersInTeam1;
    const t2Names = gameWinnerNames ? gameWinnerNames : playersInTeam2;

    if (score[0] > score[1]) {
      return <div>
        <span className='font-bold'>{t1Names[0]}</span> and <span className='font-bold'>{t1Names[1]}</span> won <span className='font-bold text-blue-500'>game</span> {score[0]} - {score[1]}
      </div>;
    }
    else {
      return <div>
        <span className='font-bold'>{t2Names[0]}</span> and <span className='font-bold'>{t2Names[1]}</span> won <span className='font-bold text-blue-500'>game</span> {score[1]} - {score[0]}
      </div>;
    }
  }

  return (
    <div className="flex flex-col justify-center items-center mx-10">
      <div className="">Round Winners</div>

      <div className='flex flex-row items-center justify-between w-full border-b border-slate-300 py-3'>
        <div><span className='font-bold'>{roundWinners?.highWinner?.nickname}</span> won <span className='font-bold text-green-500'>high</span></div>
        <div><PlayingCard cardData={roundWinners?.high} isNotPlayable /></div>
      </div>


      <div className='flex flex-row items-center justify-between w-full border-b border-slate-300 py-3'>
        <div><span className='font-bold'>{roundWinners?.lowWinner?.nickname}</span> won <span className='font-bold text-red-500'>low</span></div>
        <div><PlayingCard cardData={roundWinners?.low} isNotPlayable /></div>
      </div>

      { roundWinners?.jackWinner ?
        <div className='flex flex-row items-center justify-between w-full border-b border-slate-300 py-3'>
          <div><span className='font-bold'>{roundWinners?.jackWinner?.nickname}</span> won <span className='font-bold text-amber-500'>jack</span></div>
          <div><PlayingCard cardData={roundWinners?.jack} isNotPlayable /></div>
        </div> : null
      }

      <div className='flex flex-row py-3 items-start justify-start w-full'>
        <div>{formatGameScore(roundWinners?.game)}</div>
      </div>

    </div>
  );
}
