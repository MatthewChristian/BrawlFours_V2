import React, { useEffect, useState } from 'react';
import Modal from '../../../core/components/Modal';
import { useAppSelector } from '../../../store/hooks';
import { getKickedCards, getPlayerList, getRoundWinners } from '../../../slices/game.slice';
import { MatchWinner } from '../../../models/MatchWinner';
import RoundWinnersModalContents from './RoundWinnersModalContents';
import PlayingCard from '../PlayingCard';

interface Props {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  matchWinners: MatchWinner;
}


export default function MatchWinnersModal({ isVisible, setIsVisible, matchWinners }: Props) {

  const players = useAppSelector(getPlayerList);

  const [winByKick, setWinByKick] = useState<boolean>(false);

  const roundWinners = useAppSelector(getRoundWinners);

  const kicked = useAppSelector(getKickedCards);

  useEffect(() => {
    if (!matchWinners) {
      return;
    }

    if (matchWinners.winByKick) {
      setWinByKick(true);
    }

  }, [matchWinners]);


  return (
    <Modal open={isVisible} closeOnDocumentClick={true} onClose={() => setIsVisible(false)}>
      <div className="flex flex-col justify-center items-center mx-5">
        <div>{matchWinners?.matchWinners[0]} and {matchWinners?.matchWinners[1]} won the match!</div>
        {
          winByKick && kicked ?
            <div className='flex flex-row items-center justify-center gap-5 w-full border-b border-slate-300 py-3'>
              <div><PlayingCard cardData={kicked[kicked.length - 1]} /></div>
              <div>was kicked!</div>
            </div>
            :
            <RoundWinnersModalContents players={players} roundWinners={roundWinners} gameWinnerNames={matchWinners?.gameWinners} />
        }

      </div>
    </Modal>
  );
}
