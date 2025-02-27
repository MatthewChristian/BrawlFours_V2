import React from 'react'
import HangSaverIcon from './StatusIcons/HangSaverIcon'
import { CardAbilities } from '../../core/services/abilities'
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
      <TwoWinGameIcon active={playerStatus.includes(CardAbilities.twoWinGame)} />
      <NextCardTrumpIcon active={playerStatus.includes(CardAbilities.nextCardTrump)} />
      <HangSaverIcon active={playerStatus.includes(CardAbilities.hangSaver)} />
      <ChooseStarterIcon active={playerStatus.includes(CardAbilities.chooseStarter)} />
      <AllyPlaysLastIcon active={playerStatus.includes(CardAbilities.allyPlaysLast)} />
    </React.Fragment>
  )
}
