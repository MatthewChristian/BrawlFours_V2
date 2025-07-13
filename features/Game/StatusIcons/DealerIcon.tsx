import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import { IoIosBowtie } from 'react-icons/io';

interface Props {
  active?: boolean;
}

export default function DealerIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<IoIosBowtie />}
      twBgColour='bg-gray-200'
      twTextColour='text-gray-700'
      twBorderColour='border-gray-700'
      active={active}
      tooltip="This player was this round's dealer"
      shortcode='player_dealer'
    />
  );
}
