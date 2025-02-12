import React from 'react'
import HangSaverIcon from './StatusIcons/HangSaverIcon'
import { CardAbilities } from '../../core/services/abilities'
import AllyPlaysLastIcon from './StatusIcons/AllyPlaysLastIcon';

interface Props {
  playerStatus: CardAbilities[];
}

export default function PlayerStatusIcons({ playerStatus }: Props) {
  return (
    <React.Fragment>
      <HangSaverIcon active={playerStatus.includes(CardAbilities.hangSaver)} />
      <AllyPlaysLastIcon active={playerStatus.includes(CardAbilities.allyPlaysLast)} />
    </React.Fragment>
  )
}
