import React, { useEffect, useState } from 'react';
import Modal from '../../../core/components/Modal';
import { useAppSelector } from '../../../store/hooks';
import { getPlayerList } from '../../../slices/game.slice';

interface Props {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  matchWinner: number;
}


export default function MatchWinnersModal({ isVisible, setIsVisible, matchWinner }: Props) {

  const players = useAppSelector(getPlayerList);

  const [matchWinnerNames, setMatchWinnerNames] = useState<string[]>([]);

  useEffect(() => {
    if (!matchWinner || !players || players.length == 0) {
      return;
    }

    const winnerNames: string[] = [];

    players.forEach(el => {
      if (el.team == matchWinner) {
        winnerNames.push(el.nickname);
      }
    });

    setMatchWinnerNames(winnerNames);

  }, [matchWinner, players]);


  return (
    <Modal open={isVisible} closeOnDocumentClick={true} onClose={() => setIsVisible(false)}>
      <div className="flex flex-col justify-center items-center mx-5">
        <div>{matchWinnerNames[0]} and {matchWinnerNames[1]} won the match!</div>
      </div>
    </Modal>
  );
}
