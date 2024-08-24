import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';

interface Props {
  active?: boolean;
}

export default function TurnIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<div className='font-bold'>T</div>}
      twBgColour='bg-green-200'
      twTextColour='text-green-600'
      twBorderColour='border-green-600'
      active={active}
    />
  );
}
