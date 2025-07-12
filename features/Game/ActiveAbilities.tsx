import React from 'react';
import { CardAbilities } from '../../core/services/abilities';
import AbilitiesDisabledIcon from './StatusIcons/AbilitiesDisabledIcon';
import DoubleLift2Icon from './StatusIcons/DoubleLift2Icon';
import DoubleLiftIcon from './StatusIcons/DoubleLiftIcon';
import DoublePointsIcon from './StatusIcons/DoublePointsIcon';
import NinePowerfulIcon from './StatusIcons/NinePowerfulIcon';
import NoWinLiftIcon from './StatusIcons/NoWinLiftIcon';
import OppositePowerIcon from './StatusIcons/OppositePowerIcon';
import RoyalsDisabledIcon from './StatusIcons/RoyalsDisabledIcon';
import TrumpDisabledIcon from './StatusIcons/TrumpDisabledIcon';
import { useAppSelector } from '../../store/hooks';
import { getActiveAbilities, getDoubleLiftCards } from '../../slices/game.slice';

export default function ActiveAbilities() {

  const activeAbilities = useAppSelector(getActiveAbilities);

  const doubleLiftCards = useAppSelector(getDoubleLiftCards);

  return (
    <React.Fragment>
      <AbilitiesDisabledIcon active={activeAbilities?.includes(CardAbilities.abilitiesDisabled)} />
      <RoyalsDisabledIcon active={activeAbilities?.includes(CardAbilities.royalsDisabled)} />
      <TrumpDisabledIcon active={activeAbilities?.includes(CardAbilities.trumpDisabled)} />
      <NoWinLiftIcon active={activeAbilities?.includes(CardAbilities.noWinLift)} />
      <OppositePowerIcon active={activeAbilities?.includes(CardAbilities.oppositePower)} />
      <DoubleLiftIcon active={activeAbilities?.includes(CardAbilities.doubleLift)} />
      <DoubleLift2Icon active={(doubleLiftCards?.length > 0)} />
      <DoublePointsIcon active={activeAbilities?.includes(CardAbilities.doublePoints)} />
      <NinePowerfulIcon active={activeAbilities?.includes(CardAbilities.ninePowerful)} />
    </React.Fragment>
  );
}
