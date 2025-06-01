import React from 'react';
import HangSaverIcon from './StatusIcons/HangSaverIcon';
import { CardAbilities } from '../../core/services/abilities';
import AllyPlaysLastIcon from './StatusIcons/AllyPlaysLastIcon';
import ChooseStarterIcon from './StatusIcons/ChooseStarterIcon';
import TwoWinGameIcon from './StatusIcons/TwoWinGameIcon';
import NextCardTrumpIcon from './StatusIcons/NextCardTrumpIcon';

interface Props {
  playerStatus: CardAbilities[];
}

export default function PlayerStatusIcons({ playerStatus }: Props) {
  return (
    <React.Fragment>
      <TwoWinGameIcon active />
      <NextCardTrumpIcon active />
      <HangSaverIcon active />
      <ChooseStarterIcon active />
      <AllyPlaysLastIcon active />
    </React.Fragment>
  );
}
