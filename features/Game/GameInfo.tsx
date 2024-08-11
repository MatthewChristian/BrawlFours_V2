import React, { useMemo } from 'react';
import PlayingCard from './PlayingCard';
import { useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getGame, getKickedCards, getTeamScore } from '../../slices/game.slice';
import TrumpDisabledIcon from './StatusIcons/TrumpDisabledIcon';
import AbilitiesDisabledIcon from './StatusIcons/AbilitiesDisabledIcon';
import DoubleLiftIcon from './StatusIcons/DoubleLiftIcon';
import DoublePointsIcon from './StatusIcons/DoublePointsIcon';
import NinePowerfulIcon from './StatusIcons/NinePowerfulIcon';
import NoWinLiftIcon from './StatusIcons/NoWinLiftIcon';
import OppositePowerIcon from './StatusIcons/OppositePowerIcon';
import RoyalsDisabledIcon from './StatusIcons/RoyalsDisabledIcon';
import TwoWinGameIcon from './StatusIcons/TwoWinGameIcon';
import { CardAbilities } from '../../core/services/abilities';

interface Props {
  playerTeam?: number;
}

export default function GameInfo({ playerTeam } : Props) {


  const kickedCards = useAppSelector(getKickedCards);

  const teamScore = useAppSelector(getTeamScore);

  const game = useAppSelector(getGame);

  const activeAbilities = useAppSelector(getActiveAbilities);

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

      <div className='flex flex-row flex-wrap gap-2 my-5'>
        <AbilitiesDisabledIcon active={activeAbilities?.includes(CardAbilities.abilitiesDisabled)} />
        <DoubleLiftIcon active={activeAbilities?.includes(CardAbilities.doubleLift)} />
        <DoublePointsIcon active={activeAbilities?.includes(CardAbilities.doublePoints)} />
        <NinePowerfulIcon active={activeAbilities?.includes(CardAbilities.ninePowerful)} />
        <NoWinLiftIcon active={activeAbilities?.includes(CardAbilities.noWinLift)} />
        <OppositePowerIcon active={activeAbilities?.includes(CardAbilities.oppositePower)} />
        <RoyalsDisabledIcon active={activeAbilities?.includes(CardAbilities.royalsDisabled)} />
        <TrumpDisabledIcon active={activeAbilities?.includes(CardAbilities.trumpDisabled)} />
        <TwoWinGameIcon active={activeAbilities?.includes(CardAbilities.twoWinGame)} />
      </div>

      <div>
        <p>Score: {teamScoreOrdered[0]} - {teamScoreOrdered[1]}</p>
      </div>

      <div>
        <p>Game: {gameOrdered[0]} - {gameOrdered[1]}</p>
      </div>

    </div>
  );
}
