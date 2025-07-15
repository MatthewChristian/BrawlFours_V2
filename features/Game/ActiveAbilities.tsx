import React, { useMemo } from 'react';
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
import { AnimatePresence } from 'framer-motion';

export default function ActiveAbilities() {

  const activeAbilities = useAppSelector(getActiveAbilities);

  const doubleLiftCards = useAppSelector(getDoubleLiftCards);

  const activeItems = useMemo(() => {
    return [
      <AbilitiesDisabledIcon key='ad' active={activeAbilities?.includes(CardAbilities.abilitiesDisabled)} />,
      <RoyalsDisabledIcon key='rd' active={activeAbilities?.includes(CardAbilities.royalsDisabled)} />,
      <TrumpDisabledIcon key='td' active={activeAbilities?.includes(CardAbilities.trumpDisabled)} />,
      <NoWinLiftIcon key='nwl' active={activeAbilities?.includes(CardAbilities.noWinLift)} />,
      <OppositePowerIcon key='op' active={activeAbilities?.includes(CardAbilities.oppositePower)} />,
      <DoubleLiftIcon key='dl' active={activeAbilities?.includes(CardAbilities.doubleLift)} />,
      <DoubleLift2Icon key='dl2' active={(doubleLiftCards?.length > 0)} />,
      <DoublePointsIcon key='dp' active={activeAbilities?.includes(CardAbilities.doublePoints)} />,
      <NinePowerfulIcon key='np' active={activeAbilities?.includes(CardAbilities.ninePowerful)} />,
    ];
  }, [activeAbilities, doubleLiftCards]);

  return (
    <>
      <AnimatePresence>
        {
          // Need to do filter otherwise spring animation to close gaps between icons won't work
          activeItems.filter((item) => item.props.active).map((item) =>  item)
        }
      </AnimatePresence>
    </>
  );
}
