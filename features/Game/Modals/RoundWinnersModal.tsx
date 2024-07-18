import React from 'react';
import Modal from '../../../core/components/Modal';
import PlayingCard from '../PlayingCard';
import { RoundWinners } from '../../../models/RoundWinners';
import { PlayerSocket } from '../../../models/PlayerSocket';

interface Props {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  roundWinners?: RoundWinners;
  players?: PlayerSocket[]
}

export default function RoundWinnersModal({ isVisible, setIsVisible, roundWinners, players }: Props) {

  function formatGameScore(score?: number[]) {

    if (!score) {
      return undefined;
    }

    const playersInTeam1: PlayerSocket[] = [];
    const playersInTeam2: PlayerSocket[] = [];

    players.forEach((el) => {
      if (el.team == 1) {
        playersInTeam1.push(el);
      }
      else {
        playersInTeam2.push(el);
      }
    });

    if (score[0] > score[1]) {
      return <div>
        <span className='font-bold'>{playersInTeam1[0].nickname}</span> and <span className='font-bold'>{playersInTeam1[1].nickname}</span> won <span className='font-bold text-blue-500'>game</span> {score[0]} - {score[1]}
      </div>;
    }
    else {
      return <div>
        <span className='font-bold'>{playersInTeam2[0].nickname}</span> and <span className='font-bold'>{playersInTeam2[1].nickname}</span> won <span className='font-bold text-blue-500'>game</span> {score[1]} - {score[0]}
      </div>;
    }

  }

  return (
    <Modal open={isVisible} closeOnDocumentClick={true} onClose={() => setIsVisible(false)}>
      <div className="flex flex-col justify-center items-center mx-10">
        <div className="">Round Winners</div>

        <div className='flex flex-row items-center justify-between w-full border-b border-slate-300 py-3'>
          <div><span className='font-bold'>{roundWinners?.highWinner?.nickname}</span> won <span className='font-bold text-green-500'>high</span></div>
          <div><PlayingCard cardData={roundWinners.high} /></div>
        </div>


        <div className='flex flex-row items-center justify-between w-full border-b border-slate-300 py-3'>
          <div><span className='font-bold'>{roundWinners?.lowWinner?.nickname}</span> won <span className='font-bold text-red-500'>low</span></div>
          <div><PlayingCard cardData={roundWinners.low} /></div>
        </div>

        <div className='flex flex-row items-center justify-between w-full border-b border-slate-300 py-3'>
          <div><span className='font-bold'>{roundWinners?.jackWinner?.nickname}</span> won <span className='font-bold text-amber-500'>jack</span></div>
          <div><PlayingCard cardData={roundWinners.jack} /></div>
        </div>

        <div className='flex flex-row py-3 items-start justify-start w-full'>
          <div>{formatGameScore(roundWinners?.game)}</div>
        </div>

      </div>
    </Modal>
  );
}
