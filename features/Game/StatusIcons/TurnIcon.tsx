import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';

interface Props {
  active?: boolean;
}

export default function TurnIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<div className='mt-1 font-bold'>T</div>}
      twBgColour='bg-green-200'
      twTextColour='text-green-600'
      twBorderColour='border-green-600'
      active={active}
      tooltip="It is this player's turn to play"
      shortcode='player_turn'
    />
  );
}
