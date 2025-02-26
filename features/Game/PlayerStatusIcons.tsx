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
      <HangSaverIcon active={playerStatus.includes(CardAbilities.hangSaver)} />
      <TwoWinGameIcon active={playerStatus.includes(CardAbilities.twoWinGame)} />
      <AllyPlaysLastIcon active={playerStatus.includes(CardAbilities.allyPlaysLast)} />
      <ChooseStarterIcon active={playerStatus.includes(CardAbilities.chooseStarter)} />
      <NextCardTrumpIcon active={playerStatus.includes(CardAbilities.nextCardTrump)} />
    </React.Fragment>
  )
}
