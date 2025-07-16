import React from 'react';
import StatusIcon from '../../../core/components/StatusIcon';
import Image from 'next/image';
import jackHangedSvg from '../../../public/images/statusIcons/jackHanged.svg';


interface Props {
  active?: boolean;
}

export default function JackHangedIcon({ active }: Props) {
  return (
    <StatusIcon
      icon={<Image priority
        src={jackHangedSvg}
        alt="" />}
      twBgColour='bg-white'
      twBorderColour='border-gray-500'
      tooltip='This clong got their jack hang!'
      shortcode='jackHanged'
      active={active}
    />
  );
}
