import React from 'react';
import HangSaverIcon from './StatusIcons/HangSaverIcon';
import { CardAbilities } from '../../core/services/abilities';
import AllyPlaysLastIcon from './StatusIcons/AllyPlaysLastIcon';
import ChooseStarterIcon from './StatusIcons/ChooseStarterIcon';
import TwoWinGameIcon from './StatusIcons/TwoWinGameIcon';
import NextCardTrumpIcon from './StatusIcons/NextCardTrumpIcon';
import DealerIcon from './StatusIcons/DealerIcon';
import TurnIcon from './StatusIcons/TurnIcon';
import { PlayerSocket } from '../../models/PlayerSocket';

interface Props {
  playerStatus: CardAbilities[];
  dealerData?: PlayerSocket;
  turnPlayerData?: PlayerSocket;
  playerData?: PlayerSocket;
  className?: string;
}

export default function PlayerStatusIcons({ playerStatus, dealerData, turnPlayerData, playerData, className }: Props) {
  return (
    <div className={className}>
      <DealerIcon active={dealerData && playerData.id == dealerData.id} />
      <TurnIcon active={turnPlayerData && playerData.id == turnPlayerData.id} />
      <TwoWinGameIcon active={playerStatus.includes(CardAbilities.twoWinGame)} />
      <NextCardTrumpIcon active={playerStatus.includes(CardAbilities.nextCardTrump)} />
      <HangSaverIcon active={playerStatus.includes(CardAbilities.hangSaver)} />
      <ChooseStarterIcon active={playerStatus.includes(CardAbilities.chooseStarter)} />
      <AllyPlaysLastIcon active={playerStatus.includes(CardAbilities.allyPlaysLast)} />
    </div>
  );
}
