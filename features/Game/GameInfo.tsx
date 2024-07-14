import React, { useMemo, useState } from 'react';
import PlayingCard from './PlayingCard';
import { useAppSelector } from '../../store/hooks';
import { getGame, getKickedCards, getTeamScore } from '../../slices/game.slice';

interface Props {
  playerTurn?: number;
  playerTeam?: number;
}

export default function GameInfo({ playerTurn, playerTeam } : Props) {


  const kickedCards = useAppSelector(getKickedCards);

  const teamScore = useAppSelector(getTeamScore);

  const game = useAppSelector(getGame);

  const teamScoreOrdered = useMemo(() => {
    return orderScore(teamScore);
  }, [teamScore, playerTeam]);

  const gameOrdered = useMemo(() => {
    return orderScore(game);
  }, [game, playerTeam]);


  // --------------------------------

  // Manage team scores
  const [score, setScore] = useState<number[]>([0, 0]);

  // Manage which suit is trump
  const [trump, setTrump] = useState<string>();

  // Manage cards in a lift
  const [lift, setLift] = useState<number[]>([-200, 0, 0, 0, 0]);

  // Indicate if round ended
  const [liftEnded, setLiftEnded] = useState<number>(0);

  // Indicate which team won a lift
  const [liftWinner, setLiftWinner] = useState<number>(0);

  // Manage how many players have played in a round
  const [count, setCount] = useState<number>(1);

  // Manage each team's total score
  const [t1Score, setT1Score] = useState<number>(0);
  const [t2Score, setT2Score] = useState<number>(0);

  // Manage values for high, low, game and jack
  const [high, setHigh] = useState<number>(0);
  const [low, setLow] = useState<number>(15);
  const [jack, setJack] = useState<number>(1);

  // Indicate which team played jack
  const [jackPlayer, setJackPlayer] = useState<number>(0);

  // Indicate if jack is in the current lift
  const [jackInPlay, setJackInPlay] = useState<boolean>(false);

  // Indicate which team hung jack
  const [jackHangerTeam, setJackHangerTeam] = useState<number>(0);

  // Indicate the power of the card which hung jack
  const [jackHangerValue, setJackHangerValue] = useState<number>(0);

  // Manage which team won what point
  const [gameWinner, setGameWinner] = useState<number>(0);
  const [highWinner, setHighWinner] = useState<number>(0);
  const [lowWinner, setLowWinner] = useState<number>(0);
  const [jackWinner, setJackWinner] = useState<number>(0);


  // Indicate whether or not to show which team won what
  const [show, setShow] = useState<boolean>(false);

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
    <div className="bg-red-100 p-2 h-screen w-1/5">

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
        <div>
          <p>Score: {teamScoreOrdered[0]} - {teamScoreOrdered[1]}</p>
        </div>
        <div>
          <p>It is player {playerTurn}&apos;s turn</p>
        </div>
      </div>
      <div>
        <p>Game: {gameOrdered[0]} - {gameOrdered[1]}</p>
      </div>
      <div>
        {show ?
          (
            <p>Team {highWinner} won high with {high}</p>
          ) : (null)
        }
      </div>
      <div>
        {show ?
          (
            <p>Team {lowWinner} won low with {low}</p>
          ) : (null)
        }
      </div>
      <div>
        {show && jackWinner > 0 ?
          (
            <p>Team {jackWinner} won jack</p>
          ) : (null)
        }
      </div>
      <div>
        {show && jackWinner != jackPlayer ?
          (
            <p>Team {jackWinner} hung jack!</p>
          ) : (null)
        }
      </div>
      <div>
        {show ?
          (
            <p>Team {lowWinner} won game {teamScoreOrdered[0]} - {teamScoreOrdered[1]}</p>
          ) : (null)
        }
      </div>
      <div>
        {liftWinner > 0 ?
          (
            <p>Player {liftWinner} won the lift</p>
          ) : (null)
        }
      </div>
      <div>
        <div>
          <p> Kicked: </p>

        </div>
      </div>
    </div>
  );
}
