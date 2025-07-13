import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import { FaChessPawn } from 'react-icons/fa6';

interface Props {
  active?: boolean;
}

export default function TurnIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<FaChessPawn />}
      twBgColour='bg-purple-200'
      twTextColour='text-purple-700'
      twBorderColour='border-purple-700'
      active={active}
      tooltip="It is this player's turn to play"
      shortcode='player_turn'
    />
  );
}
