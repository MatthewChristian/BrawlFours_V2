import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';

interface Props {
  active?: boolean;
}

export default function DealerIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<div className='font-bold mt-1'>D</div>}
      twBgColour='bg-blue-200'
      twTextColour='text-blue-500'
      twBorderColour='border-blue-500'
      active={active}
      tooltip="This player was this round's dealer"
      shortcode='player_dealer'
    />
  );
}
