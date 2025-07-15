import React, { useMemo } from 'react';
import HangSaverIcon from './StatusIcons/HangSaverIcon';
import { CardAbilities } from '../../core/services/abilities';
import AllyPlaysLastIcon from './StatusIcons/AllyPlaysLastIcon';
import ChooseStarterIcon from './StatusIcons/ChooseStarterIcon';
import TwoWinGameIcon from './StatusIcons/TwoWinGameIcon';
import NextCardTrumpIcon from './StatusIcons/NextCardTrumpIcon';
import DealerIcon from './StatusIcons/DealerIcon';
import TurnIcon from './StatusIcons/TurnIcon';
import { PlayerSocket } from '../../models/PlayerSocket';
import { AnimatePresence } from 'framer-motion';

interface Props {
  playerStatus: CardAbilities[];
  dealerData?: PlayerSocket;
  turnPlayerData?: PlayerSocket;
  playerData?: PlayerSocket;
  className?: string;
}

export default function PlayerStatusIcons({ playerStatus, dealerData, turnPlayerData, playerData, className }: Props) {

  const activeItems = useMemo(() => {
    return [
      <DealerIcon key='di' active={dealerData && playerData.id == dealerData.id} />,
      <TurnIcon key='ti' active={turnPlayerData && playerData.id == turnPlayerData.id} />,
      <TwoWinGameIcon key='twg' active={playerStatus.includes(CardAbilities.twoWinGame)} />,
      <NextCardTrumpIcon key='nct' active={playerStatus.includes(CardAbilities.nextCardTrump)} />,
      <HangSaverIcon key='hs' active={playerStatus.includes(CardAbilities.hangSaver)} />,
      <ChooseStarterIcon key='cs' active={playerStatus.includes(CardAbilities.chooseStarter)} />,
      <AllyPlaysLastIcon key='apl' active={playerStatus.includes(CardAbilities.allyPlaysLast)} />,
    ];
  }, [playerStatus, dealerData, turnPlayerData, playerData]);


  return (
    <div className={className}>
      <AnimatePresence>
        {
          // Need to do filter otherwise spring animation to close gaps between icons won't work
          activeItems.filter((item) => item.props.active).map((item) => item)
        }
      </AnimatePresence>
    </div>
  );
}
